import FeeStructure from '../models/FeeStructure.js';
import StudentFee from '../models/StudentFee.js';
import FeeTransaction from '../models/FeeTransaction.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import Owner from '../models/Owner.js';

// Helper: Identify User
const identifyUser = async (userId) => {
    let user = await Admin.findById(userId);
    if (user) return { role: 'admin', institutionId: user.institutionId, name: user.name };
    user = await Owner.findById(userId);
    if (user) return { role: 'owner', institutionId: user.institutionId, name: user.name };
    user = await Student.findById(userId);
    if (user) return { role: 'student', institutionId: user.institutionId, name: user.firstName };
    return null;
};

// @desc    1. Admin sets fee for a batch
// @route   POST /api/fees/structure
// @access  Private (Admin/Owner)
export const setBatchFeeStructure = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });
        const { batchId, monthlyFee, academicMonths } = req.body;
        // academicMonths: ["June", "July", "August", ...]

        const userAuth = await identifyUser(req.user.id);
        if (!userAuth || (userAuth.role !== 'admin' && userAuth.role !== 'owner')) {
            return res.status(403).json({ msg: 'Access Denied' });
        }

        const totalAnnualFee = monthlyFee * academicMonths.length;

        // 1. Create Structure Definition
        const newStructure = new FeeStructure({
            institutionId: userAuth.institutionId,
            batchId,
            monthlyFee,
            academicMonths,
            totalAnnualFee,
            createdBy: req.user.id
        });
        await newStructure.save();

        // 2. Initialize Student Records
        // Find all students in this batch
        const batch = await Batch.findById(batchId).populate('students');
        
        // Prepare bulk operations for efficiency
        const studentFeeRecords = batch.students.map(student => {
            const monthlyStatusArray = academicMonths.map(month => ({
                month: month,
                amount: monthlyFee,
                status: 'Due'
            }));

            return {
                institutionId: userAuth.institutionId,
                studentId: student._id,
                batchId: batchId,
                feeStructureId: newStructure._id,
                monthlyStatus: monthlyStatusArray,
                totalFee: totalAnnualFee,
                paidFee: 0,
                remainingFee: totalAnnualFee
            };
        });

        // Delete old fee records for this batch (optional strategy, keeping simple here)
        await StudentFee.deleteMany({ batchId }); 
        await StudentFee.insertMany(studentFeeRecords);

        res.status(201).json({ success: true, msg: 'Fee structure set and students updated' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    2. Student View: Get My Fee Dashboard
// @route   GET /api/fees/my-fees
// @access  Private (Student)
export const getStudentFeeDetails = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        // Find the fee record for this student
        const feeRecord = await StudentFee.findOne({ studentId: req.user.id });

        if (!feeRecord) {
            return res.status(404).json({ msg: 'Fee record not found. Contact Admin.' });
        }

        res.json(feeRecord);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    3. Pay Fees (Student/Admin pays)
// @route   POST /api/fees/pay
// @access  Private
export const payFees = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { studentId, monthsToPay, paymentMethod, amount } = req.body; 
        // monthsToPay: ["June", "July"]
        // paymentMethod: "Online" | "Cash"

        const userAuth = await identifyUser(req.user.id);

        // Security: If student is paying, ensure they pay for themselves
        if (userAuth.role === 'student' && studentId !== req.user.id) {
            return res.status(403).json({ msg: 'Cannot pay for others' });
        }

        const feeRecord = await StudentFee.findOne({ studentId });
        if (!feeRecord) return res.status(404).json({ msg: 'Fee record not found' });

        // Validation: Check if selected months are actually Due
        const validMonths = feeRecord.monthlyStatus.filter(
            m => monthsToPay.includes(m.month) && m.status === 'Due'
        );

        if (validMonths.length === 0) {
            return res.status(400).json({ msg: 'Selected months are already paid or invalid' });
        }

        // Calculate total valid amount (Backend verification)
        const totalAmountToPay = validMonths.reduce((sum, item) => sum + item.amount, 0);

        // 1. Create Transaction (Receipt)
        const transaction = new FeeTransaction({
            institutionId: feeRecord.institutionId,
            studentId,
            amount: totalAmountToPay,
            monthsPaid: monthsToPay,
            paymentMethod,
            recordedBy: { userId: req.user.id, role: userAuth.role }
        });
        await transaction.save();

        // 2. Update Student Fee Record
        monthsToPay.forEach(monthName => {
            const monthRecord = feeRecord.monthlyStatus.find(m => m.month === monthName);
            if (monthRecord) {
                monthRecord.status = 'Paid';
                monthRecord.paidDate = new Date();
                monthRecord.transactionId = transaction._id;
            }
        });

        feeRecord.paidFee += totalAmountToPay;
        feeRecord.remainingFee -= totalAmountToPay;
        await feeRecord.save();

        // 3. Fetch Student Details for Receipt
        const student = await Student.findById(studentId).populate('institutionId', 'name location');

        // Return Detailed Receipt
        res.json({
            success: true,
            msg: 'Payment successful',
            receipt: {
                transactionId: transaction._id,
                date: transaction.transactionDate,
                studentName: `${student.firstName} ${student.lastName}`,
                registerNumber: student.registerNumber,
                institution: student.institutionId.name,
                class: feeRecord.className, // If stored, otherwise fetch from Batch
                monthsPaid: monthsToPay,
                amountPaid: totalAmountToPay,
                paymentMethod: paymentMethod
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    4. Admin Dashboard Stats
// @route   GET /api/fees/admin/stats?batchId=...
// @access  Private (Admin/Owner)
export const getAdminFeeStats = async (req, res) => {
    try {
        const { batchId } = req.query;
        if (!batchId) return res.status(400).json({ msg: 'Batch ID required' });

        const fees = await StudentFee.find({ batchId }).populate('studentId', 'firstName lastName registerNumber');

        const totalExpected = fees.reduce((acc, curr) => acc + curr.totalFee, 0);
        const totalCollected = fees.reduce((acc, curr) => acc + curr.paidFee, 0);
        const totalPending = fees.reduce((acc, curr) => acc + curr.remainingFee, 0);

        const unpaidStudents = fees.filter(f => f.remainingFee > 0).map(f => ({
            name: `${f.studentId.firstName} ${f.studentId.lastName}`,
            registerNumber: f.studentId.registerNumber,
            pendingAmount: f.remainingFee,
            pendingMonths: f.monthlyStatus.filter(m => m.status === 'Due').map(m => m.month)
        }));

        res.json({
            totalExpected,
            totalCollected,
            totalPending,
            unpaidStudents
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};