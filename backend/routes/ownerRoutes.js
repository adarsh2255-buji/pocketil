import express from 'express';
import { loginOwner, registerOwner } from '../controllers/ownerController.js';

const router = express.Router();

router.post('/', registerOwner)
router.post('/login', loginOwner)
export default router;