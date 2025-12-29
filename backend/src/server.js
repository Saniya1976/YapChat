    import express from 'express'
    import cors from 'cors'
    import dotenv from 'dotenv'
   import authRoutes from './routes/auth.route.js'
   import userRoutes from './routes/user.route.js'
   import chatRoutes from './routes/chat.route.js'
    import cookieParser from 'cookie-parser';
    import { generateStreamToken } from './lib/stream.js'
    import path from 'path'
    import { connectDB } from './lib/db.js'
    dotenv.config()
    const app = express();
    const __dirname = path.resolve();

    app.use(cookieParser());

    app.use(cors({
      origin: ["http://localhost:5173"],
      credentials: true
    }));
    app.use(express.json());

    connectDB();


    app.use('/api/auth',authRoutes)
    app.use('/api/users',userRoutes)
    app.use('/api/chat', chatRoutes)
     app.get('/api/get-token', async (req, res) => {
  try {
    // Get userId from auth middleware or request
    const userId = req.user.id; // Replace with your auth logic
    const token = await generateStreamToken(userId);
    res.json({ token });
  } catch (error) {
    console.error("Failed to generate token:", error);
    res.status(500).json({ error: "Token generation failed" });
  }
});

    if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../public")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
  });
}

    const PORT = process.env.PORT || 5001
    app.listen(PORT, () => {
      console.log(` Server running on port http://localhost:${PORT}`)
    })
