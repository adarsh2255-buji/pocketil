import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    className: {
        type: String,
        required: true,
        enum: ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    },
    // Array of Student IDs selected for this batch
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    creatorRole: {
        type: String, // 'owner' or 'admin'
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Batch', BatchSchema);