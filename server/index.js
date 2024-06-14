const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
const serviceAccount = require("./gym-app-43f4f-firebase-adminsdk-zi5b8-b337376688.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("New client connected");

  // fetch intial data

  const sendGymTrafficUpdate = async () => {
    const countSnapshot = await db.collection("checkIns").get();
    const count = countSnapshot.size;
    io.emit("gymTrafficUpdate", count);
  };
  sendGymTrafficUpdate();

  // app.get('/api/machine-usage', async () => {
  //   try {
  //     const usageSnapshot = await db.collection('machineUsage').get();
  //     const usageData = {};
  //     usageSnapshot.forEach((doc) => {
  //       const { machineId } = doc.data();
  //       usageData[machineId] = (usageData[machineId] || 0) + 1;
  //     });
  //     res.json(usageData);
  //   } catch (error) {
  //     console.error('Error fetching machine usage data:', error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // });
 const sendMachineTrafficUpdate= async () => {
      
        const usageSnapshot = await db.collection('machineUsage').get();
        const usageData = {};
        usageSnapshot.forEach((doc) => {
          const { machineId } = doc.data();
          usageData[machineId] = (usageData[machineId] || 0) + 1;
        });
  
        io.emit('machineTrafficUpdate',usageData);
   
    };
sendMachineTrafficUpdate();

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
      const count = countSnapshot.size;
      console.log(count);
      io.emit("gymTrafficUpdate", count);

      await sendGymTrafficUpdate();
    } catch (error) {
      console.error("Error adding check-in: ", error);
    }
  });

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
      const count = countSnapshot.size;
      io.emit("gymTrafficUpdate", count); // Emit the updated count
      await sendGymTrafficUpdate();
    } catch (error) {
      console.error("Error during check-out: ", error);
    }
  });

  socket.on("machineUsage", async (data) => {
    try {
      const userMachineSnapshot = await db.collection('machineUsage')
        .where('userId', '==', data.userId)
        .where('machineId', '==', data.machineId)
        .get();

      if (!userMachineSnapshot.empty) {
        socket.emit('machineUsage', { message: 'User already checked in for this machine' });
        return;
      }

      await db.collection("machineUsage").add({
        machineId: data.machineId,
        userId: data.userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      const usageSnapshot = await db.collection("machineUsage").get();
      const usageData = {};
      usageSnapshot.forEach((doc) => {
        const { machineId } = doc.data();
        usageData[machineId] = (usageData[machineId] || 0) + 1;
      });

      io.emit("machineUsageUpdate", usageData);
      // await sendMachineTrafficUpdate();
      await sendMachineTrafficUpdate();
    } catch (error) {
      console.error("Error adding machine usage: ", error);
    }
  });

  socket.on("deleteMachineUsage", async (data) => {
   
    try {
      const userMachineSnapshot = await db.collection('machineUsage')
      .where('userId', '==', data.userId)
      .where('machineId', '==', data.machineId)
      .get();
        if (userMachineSnapshot.empty) {
          socket.emit('machineUsage', { message: 'User not checked in for this machine' });
          return;
        }
  
        userMachineSnapshot.forEach(async (doc) => {
          await db.collection('machineUsage').doc(doc.id).delete();
        });
  
        const usageSnapshot = await db.collection('machineUsage').get();
        const usageData = {};
        usageSnapshot.forEach((doc) => {
          const { machineId } = doc.data();
          usageData[machineId] = (usageData[machineId] || 0) + 1;
        });
  
        io.emit('machineUsageUpdate', usageData);
        await sendMachineTrafficUpdate();
      } catch (error) {
        console.error('Error deleting machine usage:', error);
      }
    });
  

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
