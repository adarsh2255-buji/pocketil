import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './config/db.js';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import institutionRoutes from './routes/institutionRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';  
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import examRoutes from './routes/examRoutes.js';
import feeRoutes from './routes/feeRoutes.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express()
connectDb();

// ES module __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())

// --- Serve Uploaded Images ---
// This makes the 'uploads' folder accessible via browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//api routes
app.use('/api/institutions', institutionRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
//profile upload
app.use('/uploads', express.static('uploads'));



app.get('/', (req, res) => {
  res.send('API is running...')
})


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));