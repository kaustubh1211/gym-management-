require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

firebaseConfig.private_key = firebaseConfig.private_key.replace(/\\n/g, '\n');
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

const db = getFirestore();
const app = express();
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Cache data to minimize reads
let cachedGymTrafficCount = null;
let cachedMachineUsageData = null;

// Fetch initial data and cache it
const fetchInitialData = async () => {
  const countSnapshot = await db.collection("checkIns").get();
  cachedGymTrafficCount = countSnapshot.size;

  const usageSnapshot = await db.collection("machineUsage").get();
  cachedMachineUsageData = {};
  usageSnapshot.forEach((doc) => {
    const { machineId } = doc.data();
    cachedMachineUsageData[machineId] = (cachedMachineUsageData[machineId] || 0) + 1;
  });
};

fetchInitialData(); // Call this once on server startup

const sendGymTrafficUpdate = (socket) => {
  if (cachedGymTrafficCount !== null) {
    socket.emit("gymTrafficUpdate", cachedGymTrafficCount);
    console.log("Gym traffic update sent:", cachedGymTrafficCount);
  }
};

const sendMachineTrafficUpdate = (socket) => {
  if (cachedMachineUsageData !== null) {
    socket.emit("machineTrafficUpdate", cachedMachineUsageData);
  }
};

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send initial data once connected
  socket.on('requestInitialData', async () => {
    console.log('Initial data request received');

    const sendGymTrafficUpdate = async () => {
      const countSnapshot = await db.collection("checkIns").get();
      const count = countSnapshot.size;
      socket.emit("gymTrafficUpdate", count);
    };
    sendGymTrafficUpdate();

    const sendMachineTrafficUpdate = async () => {
      const usageSnapshot = await db.collection("machineUsage").get();
      const usageData = {};
      usageSnapshot.forEach((doc) => {
        const { machineId } = doc.data();
        usageData[machineId] = (usageData[machineId] || 0) + 1;
      });
      socket.emit("machineTrafficUpdate", usageData);
    };
    sendMachineTrafficUpdate();
  });


  // Check-in logic
  socket.on("checkIn", async (data) => {
    try {
      const userCheckInSnapshot = await db
        .collection("checkIns")
        .where("userId", "==", data.userId)
        .get();
      if (!userCheckInSnapshot.empty) {
        socket.emit("checkInError", { message: "User already checked in" });
        return;
      }

      await db.collection("checkIns").add({
        userId: data.userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      const countSnapshot = await db.collection("checkIns").get();
      cachedGymTrafficCount = countSnapshot.size;
      io.emit("gymTrafficUpdate", cachedGymTrafficCount);

    } catch (error) {
      console.error("Error adding check-in: ", error);
    }
  });

  // Check-out logic
  socket.on("checkOut", async (data) => {
    try {
      const userCheckInSnapshot = await db
        .collection("checkIns")
        .where("userId", "==", data.userId)
        .get();
      userCheckInSnapshot.forEach(async (doc) => {
        await db.collection("checkIns").doc(doc.id).delete();
      });

      const countSnapshot = await db.collection("checkIns").get();
      cachedGymTrafficCount = countSnapshot.size;
      io.emit("gymTrafficUpdate", cachedGymTrafficCount);

    } catch (error) {
      console.error("Error during check-out: ", error);
    }
  });
 
  // Machine usage logic
  socket.on("machineUsage", async (data) => {
    try {
      const userMachineSnapshot = await db
        .collection("machineUsage")
        .where("userId", "==", data.userId)
        .where("machineId", "==", data.machineId)
        .get();

      if (!userMachineSnapshot.empty) {
        socket.emit("machineUsage", {
          message: "User already checked in for this machine",
        });
        return;
      }

      await db.collection("machineUsage").add({
        machineId: data.machineId,
        userId: data.userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      const usageSnapshot = await db.collection("machineUsage").get();
      cachedMachineUsageData = {};
      usageSnapshot.forEach((doc) => {
        const { machineId } = doc.data();
        cachedMachineUsageData[machineId] = (cachedMachineUsageData[machineId] || 0) + 1;
      });

      io.emit("machineTrafficUpdate", cachedMachineUsageData);
    } catch (error) {
      console.error("Error adding machine usage: ", error);
    }
  });

  // Delete machine usage logic
  socket.on("deleteMachineUsage", async (data) => {
    try {
      const userMachineSnapshot = await db
        .collection("machineUsage")
        .where("userId", "==", data.userId)
        .where("machineId", "==", data.machineId)
        .get();
      if (userMachineSnapshot.empty) {
        socket.emit("machineUsage", {
          message: "User not checked in for this machine",
        });
        return;
      }

      userMachineSnapshot.forEach(async (doc) => {
        await db.collection("machineUsage").doc(doc.id).delete();
      });

      const usageSnapshot = await db.collection("machineUsage").get();
      cachedMachineUsageData = {};
      usageSnapshot.forEach((doc) => {
        const { machineId } = doc.data();
        cachedMachineUsageData[machineId] = (cachedMachineUsageData[machineId] || 0) + 1;
      });

      io.emit("machineTrafficUpdate", cachedMachineUsageData);
    } catch (error) {
      console.error("Error deleting machine usage:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
