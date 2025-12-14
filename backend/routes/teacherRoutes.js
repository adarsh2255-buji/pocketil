import express from 'express';
import { createTeacher, getTeachers, loginTeacher } from '../controllers/teacherController.js';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';


const router = express.Router();

// Protected: Only logged-in Owners or Admins can access this due to controller logic
router.post('/', authenticateOwner, createTeacher);

// Public: Teacher login
router.post('/login', loginTeacher);
// Protected: Get all Teachers (Owner/Admin)
router.get('/', authenticateOwner, getTeachers);

export default router;