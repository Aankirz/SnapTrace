// server.js
const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// In-memory storage of logs (for demonstration)
let allLogs = [];

// RabbitMQ channel (initialized later)
let channel;

// 1) Connect to RabbitMQ
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('snaplog'); // create or verify 'logs' queue
    console.log("Connected to RabbitMQ, queue 'logs' is ready.");
  } catch (err) {
    console.error("Failed to connect to RabbitMQ:", err);
  }
}

// 2) Endpoint to receive logs from the Python agent
app.post('/api/sessions', (req, res) => {
  try {
    const data = req.body;  
    console.log("Received sessions:", data);

    // We expect data like:
    // {
    //   device_info: {...},
    //   timestamp: "2025-03-20T12:34:56",
    //   sessions: [ {..session1..}, {..session2..} ]
    // }

    if (!data.sessions || !Array.isArray(data.sessions)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    // 2a) Store logs in memory for demonstration
    data.sessions.forEach(session => {
      // Optionally merge device_info or timestamp
      const enrichedLog = {
        ...session,
        device_info: data.device_info,
        received_at: new Date().toISOString()
      };
      allLogs.push(enrichedLog);

      // 2b) Push each session to RabbitMQ
      if (channel) {
        channel.sendToQueue('snaplog', Buffer.from(JSON.stringify(enrichedLog)));
        console.log("Log pushed to RabbitMQ queue 'snaplog':", enrichedLog);
      } else {
        console.warn("No RabbitMQ channel available, could not send to queue.");
      }
    });

    res.status(200).json({ success: true, message: "Sessions received" });
  } catch (err) {
    console.error("/api/sessions error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// 3) Endpoint to fetch logs for the frontend
app.get('/api/get-logs', (req, res) => {
  res.json({ logs: allLogs });
});

// 4) Start the server & connect RabbitMQ
const PORT = 4000;
app.listen(PORT, async () => {
  console.log(`Node backend listening at http://localhost:${PORT}`);
  await connectRabbitMQ();
});
