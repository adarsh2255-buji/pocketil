import mongoose from 'mongoose';

// Tracks the fee status for ONE student
const StudentFeeSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    feeStructureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeStructure'
    },
    // Breakdown of every month
    monthlyStatus: [{
        month: String, // "June"
        amount: Number, // 1000
        status: {
            type: String,
            enum: ['Due', 'Paid'],
            default: 'Due'
        },
        paidDate: Date,
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FeeTransaction'
        }
    }],
    // Summary
    totalFee: { type: Number, required: true },
    paidFee: { type: Number, default: 0 },
    remainingFee: { type: Number, required: true },
    
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('StudentFee', StudentFeeSchema);