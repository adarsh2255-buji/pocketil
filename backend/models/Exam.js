import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    name: {
        type: String, // e.g., "First Term Exam"
        required: true,
        trim: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: String, // e.g., "2 Hours", "90 Mins"
        required: true
    },
    // Define what subjects are in this exam
    subjects: [{
        name: { type: String, required: true }, // e.g., "Mathematics"
        maxMarks: { type: Number, required: true }, // e.g., 100
        passMarks: { type: Number, required: true } // e.g., 40
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    creatorRole: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Exam', ExamSchema);