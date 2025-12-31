import mongoose from 'mongoose';

const ExpenditureSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['Salary', 'Rent', 'Utilities', 'Maintenance', 'Supplies', 'Other'],
        default: 'Other'
    },
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin' 
    }
});

export default mongoose.model('Expenditure', ExpenditureSchema);