import Admin from "../models/Admin.js";
import Owner from "../models/Owner.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



// @desc    Create a new Admin
// @route   POST /api/admins
// @access  Private (Only Owner can create)
export const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // req.user.id comes from the auth middleware (the logged-in Owner)
        const ownerId = req.user.id;
        
        // Find the owner to get their Institution ID
        const owner = await Owner.findById(ownerId);
        if (!owner) {
            return res.status(404).json({ msg: 'Owner not found' });
        }

        // Check if admin email already exists
        let existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ msg: 'Admin with this email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            institutionId: owner.institutionId, // Link Admin to Owner's Institution
            createdBy: ownerId,
            name,
            email,
            password: hashedPassword
        });
        await newAdmin.save();

        res.status(201).json({
            success: true,
            msg: 'Admin created successfully',
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                institutionId: newAdmin.institutionId
            }
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ msg: 'Server error' });
    }
}


// @desc    Login Admin
// @route   POST /api/admins/login
// @access  Public
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    

    try {
        let admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: admin._id,
                role: 'admin' // Useful for frontend to know this is an admin
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
                    admin: {
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        institutionId: admin.institutionId
                    }
                });
            }
        );
        
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};