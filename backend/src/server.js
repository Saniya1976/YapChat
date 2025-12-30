import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";
import { generateStreamToken } from "./lib/stream.js";

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

/* ---------- MIDDLEWARE ---------- */
app.use(
  cors({
    origin: true, // SAME origin (Render domain)
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ---------- DB ---------- */
connectDB();

/* ---------- API ROUTES ---------- */
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Token generation failed" });
  }
});

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* ---------- SERVE FRONTEND ---------- */
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

/* ---------- START ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
