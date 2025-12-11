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
// @access  Private (Teacher/Admin/Owner)
export const createExam = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { batchId, name, scheduledDate, duration, subjects } = req.body;
        // subjects format: [{ name: "Math", maxMarks: 100, passMarks: 40 }, ...]

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

// @desc    Get Exam & Students (For Grading Sheet UI)
// @route   GET /api/exams/:examId/grading-sheet
// @access  Private
export const getExamForGrading = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { examId } = req.params;
        const exam = await Exam.findById(examId);
        
        if (!exam) return res.status(404).json({ msg: 'Exam not found' });

        // Fetch students in the batch
        const batch = await Batch.findById(exam.batchId).populate('students', 'firstName lastName registerNumber');

        // Check if marks already exist for this exam to pre-fill the UI
        const existingResults = await ExamResult.find({ examId });

        res.json({
            examDetails: exam,
            students: batch.students,
            existingResults // If empty, UI shows empty inputs. If data exists, UI shows filled inputs (edit mode).
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Submit Marks (Bulk)
// @route   POST /api/exams/marks
// @access  Private
export const submitExamMarks = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { examId, studentMarks } = req.body;
        // studentMarks: Array of objects
        // [
        //   { 
        //     studentId: "...", 
        //     isAbsent: false, 
        //     obtainedMarks: { "Math": 80, "Science": 90 } 
        //   },
        //   { studentId: "...", isAbsent: true }
        // ]

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

            // Calculate results based on Exam blueprint
            exam.subjects.forEach(sub => {
                totalMax += sub.maxMarks;
                
                // If absent, marks are 0
                const marksGot = isAbsent ? 0 : (obtainedMarks[sub.name] || 0);
                totalObtained += Number(marksGot);

                // Determine subject-wise pass/fail
                const isSubjectPass = marksGot >= sub.passMarks;
                if (!isSubjectPass && !isAbsent) finalStatus = 'Failed'; // Fail if any subject is failed

                processedSubjectResults.push({
                    subjectName: sub.name,
                    maxMarks: sub.maxMarks,
                    obtainedMarks: marksGot,
                    passStatus: isSubjectPass ? 'Pass' : 'Fail'
                });
            });

            if (isAbsent) finalStatus = 'Absent';

            const percentage = (totalObtained / totalMax) * 100;

            // Prepare the operation for bulkWrite (Upsert: Update if exists, Insert if new)
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

        // Execute all database operations in one go
        await ExamResult.bulkWrite(bulkOperations);

        res.json({ success: true, msg: 'Marks submitted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};