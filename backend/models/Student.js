import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true
    },
    registerNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
     profilePhoto: {
        type: String
    },
    className: {
        type: String,
        enum: ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'] 
    },
    medium: {
        type: String,
        enum: ['English', 'Malayalam']
    },
    syllabus: {
        type: String,
        enum: ['State', 'CBSE', 'ICSE']
    },
    schoolName: {
        type: String
    },
    fatherName: {
        type: String
    },
    motherName: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    whatsappNumber: {
        type: String
    },
    address: {
        type: String
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const Student = mongoose.model('Student', StudentSchema);
export default Student;