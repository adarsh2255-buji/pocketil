import express from 'express';

import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';
import { createBatch, getAllBatches, getStudentsByClass, updateBatch } from '../controllers/batchControllers.js';


const router = express.Router();

// 1. Get students for a specific class (to populate the selection list)
// Usage: GET /api/batches/students?className=X
router.get('/students', authenticateOwner, getStudentsByClass);

// 2. Create the batch
// Usage: POST /api/batches
router.post('/', authenticateOwner, createBatch);
// 3. Update Batch (Rename / Add Students)
router.put('/:id', authenticateOwner, updateBatch);
// 4. Get All Batches (For Dashboard List)
router.get('/', authenticateOwner, getAllBatches);

export default router;