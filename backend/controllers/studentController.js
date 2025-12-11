import Institution from "../models/Institution.js";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
// @desc    Register a new student
// @route   POST /api/students
// @access  Public


export const registerStudent = async (req, res) => {
    try {
        const { firstName, lastName, dob, institutionId } = req.body;
        if (!firstName || !lastName || !dob || !institutionId) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // 1. Find the Institution to get its name and current count
        const institution = await Institution.findById(institutionId);
        if (!institution) {
            return res.status(404).json({ msg: 'Institution not found' });
        }

        // --- Logic for Register Number ---
        // Increment the student count for this institution
        // Note: This is a simple counter. For high-concurrency apps, use findOneAndUpdate
        let currentCount = institution.studentCount + 1;

        // Update institution count in DB immediately so next request gets next number
        institution.studentCount = currentCount;
        await institution.save();

        // Get first 3 letters of institution name (uppercase)
        // Handle names shorter than 3 letters just in case
        const namePrefix = institution.name.replace(/\s/g, '').substring(0, 3).toUpperCase();
        // Pad the number with a zero if it's single digit (1 -> 01, 10 -> 10)
        const countSuffix = currentCount < 10 ? `0${currentCount}` : currentCount;
        const registerNumber = `${namePrefix}${countSuffix}`;

        // --- Logic for Temporary Password ---
        // Format: FirstName (Capitalized) + Last 2 digits of Birth Year
        
        // 1. Get Birth Year (last 2 digits)
        const birthDate = new Date(dob);
        const yearSuffix = birthDate.getFullYear().toString().slice(-2);

        // 2. Capitalize First Name (Rahul -> Rahul, rahul -> Rahul)
        const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

        const tempPassword = `${capitalizedName}${yearSuffix}`;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

         // Create Student
        const newStudent = new Student({
            institutionId,
            firstName,
            lastName,
            dob,
            registerNumber,
            password: hashedPassword
        });
        await newStudent.save();
        
        res.status(201).json({
            success: true,
            msg: 'Student registered successfully',
            data: {
                studentId: newStudent._id,
                registerNumber: newStudent.registerNumber,
                // Sending back the raw temp password so the user can see it once
                temporaryPassword: tempPassword 
            }
        });   
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Login Student
// @route   POST /api/students/login
// @access  Public
    export const loginStudent = async (req, res) => {
        const { registerNumber, password } = req.body;
        try {
            // 1. Check if student exists
            const student = await Student.findOne({ registerNumber });
        if (!student) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        // 2. CHECK APPROVAL STATUS
        if (!student.isApproved) {
            return res.status(403).json({ msg: 'Account waiting for Admin approval. Please contact your institution.' });
        }
        // 3. Match password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
         // 4. Return JWT
        const payload = {
            user: {
                id: student._id,
                role: 'student'
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
                    student: {
                        id: student._id,
                        firstName: student.firstName,
                        registerNumber: student.registerNumber,
                        institutionId: student.institutionId
                    }
                });
            }
        );
        } catch (error) {
            console.error('Error logging in student:', error);
            res.status(500).json({ msg: 'Server error' });
        }

    };

// @desc    Get Pending Students (For Admin)
// @route   GET /api/students/pending
// @access  Private (Admin)
export const getPendingStudents = async (req, res) => {
    try {
        const adminId = req.user.id;
        // Find Admin to get their institution ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(401).json({ msg: 'User not authorized as Admin' });
        }
        // Find students in that institution who are NOT approved
        const students = await Student.find({ 
            institutionId: admin.institutionId,
            isApproved: false 
        }).select('-password'); // Don't send passwords back
        res.json(students);
    } catch (error) {
        console.error('Error fetching pending students:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Approve a Student
// @route   PUT /api/students/approve/:id
// @access  Private (Admin)
export const approveStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const adminId = req.user.id;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(401).json({ msg: 'User not authorized as Admin' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Security: Ensure Admin approves only their own students
        if (student.institutionId.toString() !== admin.institutionId.toString()) {
            return res.status(403).json({ msg: 'Not authorized to approve students from other institutions' });
        }

        student.isApproved = true;
        await student.save();

        res.json({ success: true, msg: 'Student approved successfully', student });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    };

// @desc    Update Student Profile
// @route   PUT /api/students/profile
// @access  Private (Student)
export const updateProfile = async (req, res) => {
    try {
        const studentId = req.user.id;

        const {
            className,
            medium,
            syllabus,
            schoolName,
            fatherName,
            motherName,
            phoneNumber,
            whatsappNumber,
            address,
            password
        } = req.body;

        const profileFields = {};
        if (className) profileFields.className = className;
        if (medium) profileFields.medium = medium;
        if (syllabus) profileFields.syllabus = syllabus;
        if (schoolName) profileFields.schoolName = schoolName;
        if (fatherName) profileFields.fatherName = fatherName;
        if (motherName) profileFields.motherName = motherName;
        if (phoneNumber) profileFields.phoneNumber = phoneNumber;
        if (whatsappNumber) profileFields.whatsappNumber = whatsappNumber;
        if (address) profileFields.address = address;

        // Handle Photo Upload
        if (req.file) {
            profileFields.profilePhoto = req.file.path;
        }

        // Handle Password Update
        if (password) {
            const salt = await bcrypt.genSalt(10);
            profileFields.password = await bcrypt.hash(password, salt);
        }

        const student = await Student.findByIdAndUpdate(
            studentId,
            { $set: profileFields },
            { 
                new: true,
                runValidators: true // IMPORTANT: This enforces the 'enum' checks (V-XII, etc.)
            }
        ).select('-password');

        res.json({ success: true, msg: 'Profile updated successfully', student });

    } catch (err) {
        console.error(err.message);
        // Handle validation errors specifically
        if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Get all institutions (For the dropdown list)
// @route   GET /api/students/institutions
// @access  Public
export const getInstitutionsForDropdown = async (req, res) => {
    try {
        // Only fetch ID and Name for the dropdown
        const institutions = await Institution.find().select('name _id');
        res.json(institutions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};