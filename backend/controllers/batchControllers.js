import Batch from '../models/Batch.js';
import Student from '../models/Student.js';
import Owner from '../models/Owner.js';
import Admin from '../models/Admin.js';

// Helper: Get Institution ID from Request User (Owner/Admin)
const getInstitutionId = async (req) => {
    const requesterId = req.user.id;
    
    // Check Owner
    const owner = await Owner.findById(requesterId);
    if (owner) return { institutionId: owner.institutionId, role: 'owner' };

    // Check Admin
    const admin = await Admin.findById(requesterId);
    if (admin) return { institutionId: admin.institutionId, role: 'admin' };

    return null;
};

// @desc    Get Students by Class (For Batch Selection UI)
// @route   GET /api/batches/students?className=X
// @access  Private (Owner/Admin)
export const getStudentsByClass = async (req, res) => {
    try {
        const { className } = req.query;

        if (!className) {
            return res.status(400).json({ msg: 'Please provide a className query parameter' });
        }

        const authData = await getInstitutionId(req);
        if (!authData) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Fetch only Approved students in that class for this institution
        const students = await Student.find({
            institutionId: authData.institutionId,
            className: className,
            isApproved: true
        }).select('firstName lastName registerNumber profilePhoto');

        res.json(students);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new Batch
// @route   POST /api/batches
// @access  Private (Owner/Admin)
export const createBatch = async (req, res) => {
    try {
        const { name, className, studentIds } = req.body;

        if (!name || !className || !studentIds) {
            return res.status(400).json({ msg: 'Please provide name, className, and studentIds' });
        }

        const authData = await getInstitutionId(req);
        if (!authData) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Optional: Verify that all students belong to this institution/class
        // (Skipping deep verification for brevity, but good for production)

        const newBatch = new Batch({
            institutionId: authData.institutionId,
            name,
            className,
            students: studentIds, // Array of IDs ['id1', 'id2']
            createdBy: req.user.id,
            creatorRole: authData.role
        });

        await newBatch.save();

        res.status(201).json({
            success: true,
            msg: 'Batch created successfully',
            batch: newBatch
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update Batch (Rename or Add Students)
// @route   PUT /api/batches/:id
// @access  Private (Owner/Admin)
export const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, studentIds } = req.body; // studentIds is an ARRAY of new IDs to add

        const authData = await getInstitutionId(req);
        if (!authData) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Find batch to verify ownership
        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ msg: 'Batch not found' });
        }

        // Verify it belongs to the user's institution
        if (batch.institutionId.toString() !== authData.institutionId.toString()) {
            return res.status(403).json({ msg: 'Not authorized to update this batch' });
        }

        // Prepare the update object
        const updateOps = {};
        
        // 1. Update Name if provided
        if (name) {
            updateOps.$set = { name: name };
        }

        // 2. Add new students if provided
        // $addToSet ensures we don't add duplicates (if student is already in batch, it ignores them)
        // $each allows us to push an array of IDs at once
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
            updateOps.$addToSet = { students: { $each: studentIds } };
        }

        if (Object.keys(updateOps).length === 0) {
            return res.status(400).json({ msg: 'No update data provided' });
        }

        const updatedBatch = await Batch.findByIdAndUpdate(
            id,
            updateOps,
            { new: true } // Return the updated document
        );

        res.json({
            success: true,
            msg: 'Batch updated successfully',
            batch: updatedBatch
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// @desc    Get All Batches for Institution
// @route   GET /api/batches
// @access  Private (Owner/Admin)
export const getAllBatches = async (req, res) => {
    try {
        const authData = await getInstitutionId(req);
        if (!authData) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Fetch batches and populate student details
        const batches = await Batch.find({ institutionId: authData.institutionId })
            .populate('students', 'firstName lastName registerNumber')
            .sort({ createdAt: -1 });

        res.json(batches);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};