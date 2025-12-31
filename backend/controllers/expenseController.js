import Expenditure from '../models/Expenditure.js';
import Admin from '../models/Admin.js';
import Owner from '../models/Owner.js';

// Helper: Identify User
const identifyUser = async (userId) => {
    let user = await Admin.findById(userId);
    if (user) return { role: 'admin', institutionId: user.institutionId };
    user = await Owner.findById(userId);
    if (user) return { role: 'owner', institutionId: user.institutionId };
    return null;
};

// @desc    Add New Expense
// @route   POST /api/expenses
export const addExpense = async (req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;
        const userAuth = await identifyUser(req.user.id);

        if (!userAuth) return res.status(403).json({ msg: 'Access denied' });

        const newExpense = new Expenditure({
            institutionId: userAuth.institutionId,
            title,
            amount,
            category,
            description,
            date: date || Date.now(),
            recordedBy: req.user.id
        });

        await newExpense.save();
        res.status(201).json({ success: true, msg: 'Expense added', expense: newExpense });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get Expenses
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
    try {
        const userAuth = await identifyUser(req.user.id);
        if (!userAuth) return res.status(403).json({ msg: 'Access denied' });

        const expenses = await Expenditure.find({ institutionId: userAuth.institutionId })
            .sort({ date: -1 });

        const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({ expenses, totalExpense });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};