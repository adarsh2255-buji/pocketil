import express from 'express';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';
import { createAdmin, loginAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/', authenticateOwner,createAdmin)
router.post('/login', loginAdmin)
export default router;