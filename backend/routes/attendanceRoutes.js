import express from 'express';
import { markAttendance, getBatchStudents, updateAttendance } from '../controllers/attendanceController.js';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';

const router = express.Router();

// 1. Get Students for the Attendance Form (Pre-fetch)
// UI Flow: Select Batch -> Call this API -> Show Table
router.get('/batch/:batchId', authenticateOwner, getBatchStudents);

// 2. Submit Attendance
router.post('/',authenticateOwner, markAttendance);

// 3. Edit Attendance (Admin/Owner only)
router.put('/:id', authenticateOwner, updateAttendance);

export default router;