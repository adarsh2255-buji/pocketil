import express from 'express';
import { createExam, getExamForGrading, submitExamMarks } from '../controllers/examController.js';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';

const router = express.Router();

// 1. Create a new Exam
router.post('/', authenticateOwner, createExam);

// 2. Get Data for Grading Table (Exam info + Student list)
router.get('/:examId/grading-sheet', authenticateOwner, getExamForGrading);

// 3. Submit Marks
router.post('/marks', authenticateOwner, submitExamMarks);

export default router;