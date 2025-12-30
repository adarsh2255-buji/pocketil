import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Batch from '../models/Batch.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';
import Owner from '../models/Owner.js';

// Helper: Identify User
const identifyUser = async (userId) => {
    if (!userId) return null;
    let user = await Teacher.findById(userId);
    if (user) return { role: 'teacher', institutionId: user.institutionId, name: user.name };
    user = await Admin.findById(userId);
    if (user) return { role: 'admin', institutionId: user.institutionId, name: user.name };
    user = await Owner.findById(userId);
    if (user) return { role: 'owner', institutionId: user.institutionId, name: user.name };
    return null;
};

// @desc    Create Exam (Blueprint)
// @route   POST /api/exams
export const createExam = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { batchId, name, scheduledDate, duration, subjects } = req.body;

        const userAuth = await identifyUser(req.user.id);
        if (!userAuth) return res.status(403).json({ msg: 'Access denied' });

        const newExam = new Exam({
            institutionId: userAuth.institutionId,
            batchId,
            name,
            scheduledDate,
            duration,
            subjects,
            createdBy: req.user.id,
            creatorRole: userAuth.role
        });

        await newExam.save();
        res.status(201).json({ success: true, msg: 'Exam created successfully', exam: newExam });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get All Exams for Institution (NEW)
// @route   GET /api/exams
export const getExams = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const userAuth = await identifyUser(req.user.id);
        if (!userAuth) return res.status(403).json({ msg: 'Access denied' });

        // Fetch exams and populate batch name
        const exams = await Exam.find({ institutionId: userAuth.institutionId })
            .populate('batchId', 'name className')
            .sort({ scheduledDate: -1 });

        res.json(exams);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get Exam & Students (For Grading Sheet UI)
// @route   GET /api/exams/:examId/grading-sheet
export const getExamForGrading = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { examId } = req.params;
        const exam = await Exam.findById(examId);
        
        if (!exam) return res.status(404).json({ msg: 'Exam not found' });

        const batch = await Batch.findById(exam.batchId).populate('students', 'firstName lastName registerNumber');

        const existingResults = await ExamResult.find({ examId });

        res.json({
            examDetails: exam,
            students: batch.students,
            existingResults 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Submit Marks (Bulk)
// @route   POST /api/exams/marks
export const submitExamMarks = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { examId, studentMarks } = req.body;

        const userAuth = await identifyUser(req.user.id);
        if (!userAuth) return res.status(403).json({ msg: 'Access denied' });

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ msg: 'Exam not found' });

        const bulkOperations = studentMarks.map(entry => {
            const { studentId, isAbsent, obtainedMarks } = entry;
            
            let totalMax = 0;
            let totalObtained = 0;
            let finalStatus = 'Passed';
            let processedSubjectResults = [];

            exam.subjects.forEach(sub => {
                totalMax += sub.maxMarks;
                const marksGot = isAbsent ? 0 : (obtainedMarks[sub.name] || 0);
                totalObtained += Number(marksGot);

                const isSubjectPass = marksGot >= sub.passMarks;
                if (!isSubjectPass && !isAbsent) finalStatus = 'Failed';

                processedSubjectResults.push({
                    subjectName: sub.name,
                    maxMarks: sub.maxMarks,
                    obtainedMarks: marksGot,
                    passStatus: isSubjectPass ? 'Pass' : 'Fail'
                });
            });

            if (isAbsent) finalStatus = 'Absent';

            const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

            return {
                updateOne: {
                    filter: { examId: exam._id, studentId: studentId },
                    update: {
                        $set: {
                            institutionId: userAuth.institutionId,
                            batchId: exam.batchId,
                            isAbsent: isAbsent,
                            subjectResults: processedSubjectResults,
                            totalMaxMarks: totalMax,
                            totalObtainedMarks: totalObtained,
                            percentage: percentage.toFixed(2),
                            resultStatus: finalStatus
                        }
                    },
                    upsert: true
                }
            };
        });

        await ExamResult.bulkWrite(bulkOperations);

        res.json({ success: true, msg: 'Marks submitted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};