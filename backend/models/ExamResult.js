import mongoose from 'mongoose';

const ExamResultSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    batchId: { // Redundant but useful for fast queries
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    // The flag for absenteeism
    isAbsent: {
        type: Boolean,
        default: false
    },
    // Detailed marks per subject
    subjectResults: [{
        subjectName: String,
        maxMarks: Number,
        obtainedMarks: { type: Number, default: 0 },
        passStatus: { type: String, enum: ['Pass', 'Fail'] }
    }],
    // Aggregated Data
    totalMaxMarks: { type: Number, default: 0 },
    totalObtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    resultStatus: {
        type: String,
        enum: ['Passed', 'Failed', 'Absent'],
        default: 'Passed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ExamResult', ExamResultSchema);