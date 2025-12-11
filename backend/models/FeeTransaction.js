import mongoose from 'mongoose';

// The Receipt
const FeeTransactionSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    monthsPaid: [{
        type: String // ["June", "July"]
    }],
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Online', 'Bank Transfer', 'UPI'],
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    // Who recorded this? (Could be student self-pay or admin entry)
    recordedBy: {
        userId: mongoose.Schema.Types.ObjectId,
        role: String
    }
});

export default mongoose.model('FeeTransaction', FeeTransactionSchema);