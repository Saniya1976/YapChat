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

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

connectDB();
app.use(cookieParser());
app.get('/api/auth/signup', (req, res) => {
  res.send('Welcome to the YapChat API')
})
app.get('/api/auth/login', (req, res) => {
  res.send('Login endpoint')
})
app.get('/api/auth/logout', (req, res) => {
  res.send('Logout endpoint')
})
app.get('/api/auth/onboard', (req, res) => {
  res.send('Onboarding endpoint')
})
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/chat', chatRoutes)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(` Server running on port http://localhost:${PORT}`)
})
