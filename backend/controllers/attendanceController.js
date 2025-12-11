import Attendance from '../models/Attendance.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';
import Owner from '../models/Owner.js';

// Helper: Identify the User (Teacher/Admin/Owner)
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

// @desc    Get Students for a Batch (To populate the Attendance Form)
// @route   GET /api/attendance/batch/:batchId
// @access  Private (Teacher/Admin/Owner)
export const getBatchStudents = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });
        
        const { batchId } = req.params;
        const batch = await Batch.findById(batchId).populate('students', 'firstName lastName registerNumber profilePhoto');
        
        if (!batch) {
            return res.status(404).json({ msg: 'Batch not found' });
        }

        res.json({
            batchName: batch.name,
            className: batch.className,
            students: batch.students
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Mark Attendance
// @route   POST /api/attendance
// @access  Private (Teacher/Admin/Owner)
export const markAttendance = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });

        const { batchId, date, startTime, endTime, session, absentStudentIds } = req.body;
        
        // 1. Verify User Role (Must be Teacher, Admin, or Owner)
        const userAuth = await identifyUser(req.user.id);
        if (!userAuth) return res.status(401).json({ msg: 'Unauthorized: Only Teachers, Admins, or Owners can take attendance' });

        const batch = await Batch.findById(batchId).populate('students', 'firstName lastName registerNumber');
        if (!batch) return res.status(404).json({ msg: 'Batch not found' });

        if (batch.institutionId.toString() !== userAuth.institutionId.toString()) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Check if attendance already exists for this batch/date/session to prevent duplicates
        // We use $gte and $lt to match the specific date ignoring time, or exact match if you send ISO string
        // Simple check:
        const existingRecord = await Attendance.findOne({
            batchId,
            date: new Date(date), 
            session
        });
        
        if (existingRecord) {
            return res.status(400).json({ msg: 'Attendance already taken for this session. Use update to edit.' });
        }

        const records = [];
        let totalPresent = 0;
        let totalAbsent = 0;

        batch.students.forEach(student => {
            const isAbsent = absentStudentIds.includes(student._id.toString());
            
            if (isAbsent) totalAbsent++;
            else totalPresent++;

            records.push({
                studentId: student._id,
                name: `${student.firstName} ${student.lastName}`,
                registerNumber: student.registerNumber,
                status: isAbsent ? 'Absent' : 'Present'
            });
        });

        const newAttendance = new Attendance({
            institutionId: userAuth.institutionId,
            batchId,
            date,
            startTime,
            endTime,
            session,
            records,
            metrics: {
                totalStudents: batch.students.length,
                totalPresent,
                totalAbsent
            },
            takenBy: {
                userId: req.user.id,
                role: userAuth.role,
                name: userAuth.name
            }
        });

        await newAttendance.save();

        res.status(201).json({
            success: true,
            msg: 'Attendance marked successfully',
            metrics: newAttendance.metrics,
            presentStudents: records.filter(r => r.status === 'Present'),
            absentStudents: records.filter(r => r.status === 'Absent')
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update Attendance (Edit)
// @route   PUT /api/attendance/:id
// @access  Private (Admin/Owner)
export const updateAttendance = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const { id } = req.params;
        const { absentStudentIds } = req.body;

        const userAuth = await identifyUser(req.user.id);
        
        if (!userAuth || (userAuth.role !== 'admin' && userAuth.role !== 'owner')) {
            return res.status(403).json({ msg: 'Only Admins or Owners can edit attendance' });
        }

        const attendance = await Attendance.findById(id);
        if (!attendance) return res.status(404).json({ msg: 'Attendance record not found' });

        let totalPresent = 0;
        let totalAbsent = 0;

        attendance.records.forEach(record => {
            const isAbsent = absentStudentIds.includes(record.studentId.toString());
            record.status = isAbsent ? 'Absent' : 'Present';

            if (isAbsent) totalAbsent++;
            else totalPresent++;
        });

        attendance.metrics.totalPresent = totalPresent;
        attendance.metrics.totalAbsent = totalAbsent;

        await attendance.save();

        res.json({
            success: true,
            msg: 'Attendance updated successfully',
            metrics: attendance.metrics
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    View Attendance History (Owner/Admin/Teacher)
// @route   GET /api/attendance?batchId=...&date=...
// @access  Private
export const viewAttendance = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });

        const userAuth = await identifyUser(req.user.id);
        if (!userAuth) return res.status(401).json({ msg: 'Unauthorized' });

        const { batchId, date } = req.query;

        const query = { institutionId: userAuth.institutionId };
        
        if (batchId) query.batchId = batchId;
        if (date) query.date = new Date(date); // Ensure date format matches YYYY-MM-DD sent from front

        // Sort by date descending (newest first)
        const attendanceRecords = await Attendance.find(query)
            .populate('batchId', 'name className')
            .sort({ date: -1 });

        res.json(attendanceRecords);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};