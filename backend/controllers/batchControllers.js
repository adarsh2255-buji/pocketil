import Batch from '../models/Batch.js';
import Student from '../models/Student.js';
import Owner from '../models/Owner.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

// Helper: Get Institution ID
const getInstitutionId = async (req) => {
    const requesterId = req.user.id;
    
    const owner = await Owner.findById(requesterId);
    if (owner) return { institutionId: owner.institutionId, role: 'owner' };

    const admin = await Admin.findById(requesterId);
    if (admin) return { institutionId: admin.institutionId, role: 'admin' };

    // Added Teacher Support
    const teacher = await Teacher.findById(requesterId);
    if (teacher) return { institutionId: teacher.institutionId, role: 'teacher' };

    return null;
};

// Helper: Get IDs of students already in ANY batch for this institution
// Returns a Set of Strings for O(1) lookup
const getOccupiedStudentIds = async (institutionId, excludeBatchId = null) => {
    // Explicitly cast to ObjectId for the query
    const query = { institutionId: new mongoose.Types.ObjectId(institutionId) };
    
    if (excludeBatchId) {
        query._id = { $ne: new mongoose.Types.ObjectId(excludeBatchId) }; 
    }

    // Only fetch the 'students' field
    const batches = await Batch.find(query).select('students').lean();
    
    const occupiedIds = new Set();
    
    batches.forEach(batch => {
        if (batch.students && Array.isArray(batch.students)) {
            batch.students.forEach(id => {
                occupiedIds.add(id.toString());
            });
        }
    });

    return occupiedIds;
};

// @desc    Get Unassigned Students by Class
// @route   GET /api/batches/students?className=X
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

        // Prevent caching to ensure the list is always fresh
        res.setHeader('Cache-Control', 'no-store');

        // 1. Get Set of all student IDs currently in a batch
        const occupiedIds = await getOccupiedStudentIds(authData.institutionId);

        // 2. Fetch ALL approved students in the class first
        const allStudentsInClass = await Student.find({
            institutionId: new mongoose.Types.ObjectId(authData.institutionId),
            className: className,
            isApproved: true
        }).select('firstName lastName registerNumber profilePhoto').lean();

        // 3. Filter in Memory (Javascript)
        // This is robust against Mongo ObjectId vs String type mismatches
        const availableStudents = allStudentsInClass.filter(student => 
            !occupiedIds.has(student._id.toString())
        );

        res.json(availableStudents);

    } catch (err) {
        console.error('Error in getStudentsByClass:', err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Create a new Batch
// @route   POST /api/batches
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

        // --- Server-Side Validation ---
        const occupiedIds = await getOccupiedStudentIds(authData.institutionId);
        
        // Check if any selected student ID is in the occupied list
        const conflict = studentIds.some(id => occupiedIds.has(id.toString()));

        if (conflict) {
            return res.status(400).json({ msg: 'One or more selected students are already assigned to another batch.' });
        }

        const newBatch = new Batch({
            institutionId: authData.institutionId,
            name,
            className,
            students: studentIds,
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
        console.error('Error in createBatch:', err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Update Batch (Rename or Add Students)
// @route   PUT /api/batches/:id
export const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, studentIds } = req.body; 

        const authData = await getInstitutionId(req);
        if (!authData) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ msg: 'Batch not found' });
        }

        if (batch.institutionId.toString() !== authData.institutionId.toString()) {
            return res.status(403).json({ msg: 'Not authorized to update this batch' });
        }

        const updateOps = {};
        if (name) updateOps.$set = { name: name };

        // Handle adding new students
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
            
            // Validation: Check against ALL OTHER batches (excluding current one)
            const occupiedIds = await getOccupiedStudentIds(authData.institutionId, id);

            const conflict = studentIds.some(sid => occupiedIds.has(sid.toString()));

            if (conflict) {
                return res.status(400).json({ msg: 'One or more selected students are already assigned to another batch.' });
            }

            updateOps.$addToSet = { students: { $each: studentIds } };
        }

        if (Object.keys(updateOps).length === 0) {
            return res.status(400).json({ msg: 'No update data provided' });
        }

        const updatedBatch = await Batch.findByIdAndUpdate(
            id,
            updateOps,
            { new: true }
        ).populate('students', 'firstName lastName registerNumber');

        res.json({
            success: true,
            msg: 'Batch updated successfully',
            batch: updatedBatch
        });

    } catch (err) {
        console.error('Error in updateBatch:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get All Batches for Institution
// @route   GET /api/batches
export const getAllBatches = async (req, res) => {
    try {
        const authData = await getInstitutionId(req);
        if (!authData) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const batches = await Batch.find({ institutionId: new mongoose.Types.ObjectId(authData.institutionId) })
            .populate('students', 'firstName lastName registerNumber')
            .sort({ createdAt: -1 });

        res.json(batches);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};