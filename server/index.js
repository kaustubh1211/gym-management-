const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK 
const serviceAccount = require('./gym-app-43f4f-firebase-adminsdk-zi5b8-b337376688.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { 
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('checkIn', async (data) => {
    try {
      await db.collection('checkIns').add({   
        userId: data.userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      const countSnapshot = await db.collection('checkIns').get();
      console.log("count:"+countSnapshot);
      const count = countSnapshot.size;
      io.emit('gymTrafficUpdate', count);
    } catch (error) {
      console.error('Error adding check-in: ', error);
    }
    
  });

  socket.on('machineUsage', async (data) => {
    try {
      await db.collection('machineUsage').add({
        machineId: data.machineId,
        userId: data.userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      const usageSnapshot = await db.collection('machineUsage').get();
      const usageData = {};
      usageSnapshot.forEach((doc) => {
        const { machineId } = doc.data();
        usageData[machineId] = (usageData[machineId] || 0) + 1;
      });

      io.emit('machineUsageUpdate', usageData);
    } catch (error) {
      console.error('Error adding machine usage: ', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
