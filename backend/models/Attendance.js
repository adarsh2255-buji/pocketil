import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, 
        required: true
    },
    endTime: {
        type: String, 
        required: true
    },
    session: {
        type: String,
        enum: ['Morning', 'Afternoon', 'Evening'],
        required: true
    },
    // Detailed record for each student
    records: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        name: String, 
        registerNumber: String,
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            default: 'Present'
        }
    }],
    // Summary Metrics
    metrics: {
        totalStudents: Number,
        totalPresent: Number,
        totalAbsent: Number
    },
    // Audit trail
    takenBy: {
        userId: mongoose.Schema.Types.ObjectId,
        role: String, // 'teacher', 'admin', 'owner'
        name: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Attendance', AttendanceSchema);