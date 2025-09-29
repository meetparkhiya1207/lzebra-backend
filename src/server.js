import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lzerbra-frontend.vercel.app",
      "http://localhost:3039",
      "https://lzebra-adminpanel.vercel.app",
      "http://192.168.1.9:5173",
      "http://192.168.1.9:3039",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => res.send("API is running..."));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/order", orderRoutes);

// Admin Panel
app.use("/api/client", clientRoutes);


// ✅ http server create કરો
const server = http.createServer(app);

// ✅ socket.io attach કરો
const io = new Server(server, {
  cors: {
    origin: "*", // production માં restrict કરો
    methods: ["GET", "POST"],
  },
});

// ✅ live visitors count માટે set
const connectedSockets = new Set();

io.on("connection", (socket) => {
  connectedSockets.add(socket.id);

  io.emit("liveCount", connectedSockets.size);

  socket.on("disconnect", () => {
    connectedSockets.delete(socket.id);
    io.emit("liveCount", connectedSockets.size);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
