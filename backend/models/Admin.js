import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    // Optional: Link to the Owner who created this admin
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;