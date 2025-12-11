import Teacher from '../models/Teacher.js';
import Owner from '../models/Owner.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Create a new Teacher
// @route   POST /api/teachers
// @access  Private (Owner or Admin)
export const createTeacher = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const requesterId = req.user.id; // From auth middleware

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // --- Authorization & Context Logic ---
        // We need to find out if the requester is an Owner or an Admin
        // to get the correct Institution ID.

        let institutionId = null;
        let creatorRole = null;

        // 1. Check if Owner
        const owner = await Owner.findById(requesterId);
        if (owner) {
            institutionId = owner.institutionId;
            creatorRole = 'owner';
        } else {
            // 2. Check if Admin
            const admin = await Admin.findById(requesterId);
            if (admin) {
                institutionId = admin.institutionId;
                creatorRole = 'admin';
            }
        }

        // If neither, deny access
        if (!institutionId) {
            return res.status(403).json({ msg: 'Access denied. Only Owners and Admins can create teachers.' });
        }

        // --- Teacher Creation Logic ---

        // Check for existing teacher
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ msg: 'Teacher with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newTeacher = new Teacher({
            institutionId,
            createdBy: requesterId,
            creatorRole,
            name,
            email,
            password: hashedPassword
        });

        await newTeacher.save();

        res.status(201).json({
            success: true,
            msg: 'Teacher created successfully',
            teacher: {
                id: newTeacher._id,
                name: newTeacher.name,
                email: newTeacher.email,
                institutionId: newTeacher.institutionId,
                createdBy: creatorRole
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Login Teacher
// @route   POST /api/teachers/login
// @access  Public
export const loginTeacher = async (req, res) => {
    const { email, password } = req.body;

    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: teacher._id,
                role: 'teacher'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    teacher: {
                        id: teacher._id,
                        name: teacher.name,
                        email: teacher.email,
                        institutionId: teacher.institutionId
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};