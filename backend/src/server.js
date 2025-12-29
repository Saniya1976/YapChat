import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { generateStreamToken } from "./lib/stream.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://yap-chat-frontend-eosin.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

/* ---------- DB ---------- */
connectDB();

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/get-token", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = await generateStreamToken(req.user.id);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Token generation failed" });
  }
});

/* ---------- HEALTH CHECK (IMPORTANT FOR RENDER) ---------- */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
