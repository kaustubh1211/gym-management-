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

const allowedOrigins = ['https://gym-management-client.vercel.app'];

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
    origin: 'https://gym-management-client.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

const sendGymTrafficUpdate = async (socket) => {
  const countSnapshot = await db.collection("checkIns").get();
  const count = countSnapshot.size;
  socket.emit("gymTrafficUpdate", count);
  console.log("Gym traffic update sent:", count);
};

const sendMachineTrafficUpdate = async (socket) => {
  const usageSnapshot = await db.collection("machineUsage").get();
  const usageData = {};
  usageSnapshot.forEach((doc) => {
    const { machineId } = doc.data();
    usageData[machineId] = (usageData[machineId] || 0) + 1;
  });
  socket.emit("machineTrafficUpdate", usageData);
};

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send initial data once connected
  sendGymTrafficUpdate(socket);
  sendMachineTrafficUpdate(socket);

  // Listeners for data changes
  db.collection("checkIns").onSnapshot(() => {
    sendGymTrafficUpdate(socket);
  });

  db.collection("machineUsage").onSnapshot(() => {
    sendMachineTrafficUpdate(socket);
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

      sendGymTrafficUpdate(socket);
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

      sendGymTrafficUpdate(socket);
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

      sendMachineTrafficUpdate(socket);
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

      sendMachineTrafficUpdate(socket);
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
