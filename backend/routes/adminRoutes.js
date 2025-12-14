import express from 'express';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';
import { createAdmin, getAdmins, loginAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/', authenticateOwner,createAdmin)
router.post('/login', loginAdmin)
// Protected: Get All Admins (Owner only)
router.get('/', authenticateOwner, getAdmins);
export default router;