import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js'
dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/auth/signup', (req, res) => {
  res.send('Welcome to the YapChat API')
})
app.get('/api/auth/login', (req, res) => {
  res.send('Login endpoint')
})
app.get('/api/auth/logout', (req, res) => {
  res.send('Logout endpoint')
})
app.use('/api/auth',authRoutes)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(` Server running on port http://localhost:${PORT}`)
})
