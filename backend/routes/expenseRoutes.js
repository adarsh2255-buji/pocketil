import express from 'express';
import { addExpense, getExpenses } from '../controllers/expenseController.js';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';

const router = express.Router();

router.post('/', authenticateOwner, addExpense);
router.get('/', authenticateOwner, getExpenses);

export default router;