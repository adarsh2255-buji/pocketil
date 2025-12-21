import express from 'express';
import { markAttendance, getBatchStudents, updateAttendance, viewAttendance } from '../controllers/attendanceController.js';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';

const router = express.Router();

// 1. Get Students for the Attendance Form (Pre-fetch)

router.get('/batch/:batchId', authenticateOwner, getBatchStudents);

// 2. Submit Attendance (Teacher/Admin/Owner)
router.post('/', authenticateOwner, markAttendance);

// 3. Edit Attendance (Admin/Owner only)
router.put('/:id', authenticateOwner, updateAttendance);

// 4. View Attendance History (NEW ROUTE)
// Maps to GET /api/attendance
router.get('/', authenticateOwner, viewAttendance);

export default router;