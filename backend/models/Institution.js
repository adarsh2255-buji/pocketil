import mongoose from "mongoose";

const InstitutionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    studentCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Institution = mongoose.model('Institution', InstitutionSchema);
export default Institution;
