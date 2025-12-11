import Institution from "../models/Institution.js";

// @desc    Register a new institution
// @route   POST /api/institutions
// @access  Public
export const registerInstitution = async(req, res) => {
try {
    const { name, location } = req.body;
    if(!name || !location) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    const institution = new Institution({ name, location });  
    await institution.save();
    res.status(201).json({ message: "Institution registered successfully", institution });  
    
} catch (error) {
    console.error("Error registering institution:", error);
    res.status(500).json({ message: "Server error" });
}
}