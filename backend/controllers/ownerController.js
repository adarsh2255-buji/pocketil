import Institution from "../models/Institution.js";
import Owner from "../models/Owner.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// @desc    Register a new owner
// @route   POST /api/owners
// @access  Public
export const registerOwner = async (req, res) => {
    try {
        const { name, email, password, institutionId } = req.body;
        if (!name || !email || !password || !institutionId) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        //ceck if owner with email already exists
        const existingOwner = await Owner.findOne({ email });
        if (existingOwner) {
            return res.status(400).json({ message: "Owner with this email already exists" });
        }

        //validate if institutionId exists
        const institution = await Institution.findById(institutionId);
        if (!institution) {
            return res.status(400).json({ message: "Institution not found" });
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newOwner = new Owner({
            institutionId,
            name,
            email,
            password: hashedPassword
        })
        const savedOwner = await newOwner.save();
        // Create JWT Payload
        const payload = {
            user: {
                id: savedOwner._id
            }
        };
        // sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                        res.status(201).json({
            success : true,
            msg : "Owner registered successfully",
            owner: {
                id: savedOwner._id,
                name: savedOwner.name,
                email: savedOwner.email,
                institutionId: savedOwner.institutionId
            }
        });
            }
        )

    } catch (error) {
        console.error("Error registering owner:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc    login owner
// @route   POST /api/owners/login
// @access  Public
export const loginOwner = async (req, res) => {
    const { email, password } = req.body;
    try {
        //check if owner exists
        const owner = await Owner.findOne({ email });
        if (!owner) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        //check password
        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        // Create JWT Payload
        const payload = {
            user: {
                id: owner._id
            }
        };
        // sign token 
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    success: true,
                    token,
                    owner: {
                        id: owner._id,
                        name: owner.name,
                        email: owner.email,
                        institutionId: owner.institutionId
                    }
                });
            }
        );

    } catch (error) {
        console.error("Error logging in owner:", error);
        res.status(500).json({ message: "Server error" });
    }
}