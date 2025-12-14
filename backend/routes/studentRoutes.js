import express from 'express';
import { approveStudent, getInstitutionsForDropdown, getPendingStudents, loginStudent, registerStudent, updateProfile } from '../controllers/studentController.js';
import { authenticateOwner } from '../middlewares/authenticationMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// --- Multer Configuration for Image Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // IMPORTANT: Create this folder in your project root
    },
    filename: function (req, file, cb) {
        // Generates unique filename: student-timestamp.ext
        cb(null, 'student-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2000000 }, // Limit file size to 2MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});



router.post('/', registerStudent)
router.post('/login', loginStudent);

// Protected (Admin Only): Get pending students
// Uses authentication middleware to ensure user is logged in
router.get('/pending', authenticateOwner, getPendingStudents);

// Protected (Admin Only): Approve a specific student
router.put('/approve/:id', authenticateOwner, approveStudent);

// Protected (Student Only): Update Profile
// Uses 'auth' to check login, 'upload' to handle image
router.put('/profile', authenticateOwner, upload.single('profilePhoto'), updateProfile);


router.get('/institutions', getInstitutionsForDropdown)
export default router;