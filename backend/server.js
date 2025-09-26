import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { testConnection } from './database.js';
import productsRoutes from './routes/products.js';
import incomingGroupsRoutes from './routes/incoming-groups.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

let activeUsers = 0;

io.on("connection", (socket) => {
  activeUsers++;
  io.emit("activeUsers", activeUsers);

  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("activeUsers", activeUsers);
  });
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SSR is working');
});

app.use('/api/products', productsRoutes);
app.use('/api/incoming-groups', incomingGroupsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Cannot start server: Database connection failed');
      process.exit(1);
    }

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Try: curl http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
