import mongoose from 'mongoose';

// Defines the fee rules for a specific batch
const FeeStructureSchema = new mongoose.Schema({
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
    monthlyFee: {
        type: Number,
        required: true
    },
    academicMonths: [{
        type: String // e.g., ["June", "July", "August"...]
    }],
    totalAnnualFee: {
        type: Number,
        required: true
    },
    description: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('FeeStructure', FeeStructureSchema);