import express from 'express';
import { 
    setBatchFeeStructure, 
    getStudentFeeDetails, 
    payFees, 
    getAdminFeeStats 
} from '../controllers/feeController.js';

import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';

const router = express.Router();

// Admin: Set fees for a batch (Initialize)
router.post('/structure', authenticateOwner, setBatchFeeStructure);

// Student: Get my dashboard
router.get('/my-fees', authenticateOwner, getStudentFeeDetails);

// Student/Admin: Pay Fees
router.post('/pay', authenticateOwner, payFees);

// Admin: Get Dashboard Stats
router.get('/admin/stats', authenticateOwner, getAdminFeeStats);

export default router;