    import express from 'express'
    import cors from 'cors'
    import dotenv from 'dotenv'
    import authRoutes from './routes/auth.route.js'
    import userRoutes from './routes/user.route.js'
    import chatRoutes from './routes/chat.route.js'
    import cookieParser from 'cookie-parser';

    import { connectDB } from './lib/db.js'
    dotenv.config()
    const app = express();

    app.use(cookieParser());

    app.use(cors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5174", "http://localhost:5174"],
      credentials: true
    }));
    app.use(express.json());

    connectDB();


    app.use('/api/auth',authRoutes)
    app.use('/api/users',userRoutes)
    app.use('/api/chat', chatRoutes)

    const PORT = process.env.PORT || 5001
    app.listen(PORT, () => {
      console.log(` Server running on port http://localhost:${PORT}`)
    })
