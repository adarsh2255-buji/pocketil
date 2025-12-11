import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    // Track who created this teacher (useful for audit logs)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // The creator could be an Owner or an Admin, so we don't strictly ref one model here
    },
    creatorRole: {
        type: String, // 'owner' or 'admin'
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
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
        default: 'teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Teacher', TeacherSchema);