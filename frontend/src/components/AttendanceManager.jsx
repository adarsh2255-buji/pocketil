import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Check, AlertTriangle, UserCheck, UserX, XCircle   } from 'lucide-react';
import api from '../utils/api';
const AttendanceManager = () => {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'report'
  
  // --- MARK ATTENDANCE STATES ---
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Morning');
  const [times, setTimes] = useState({ start: '09:00', end: '10:00' });
  const [absentIds, setAbsentIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // --- REPORT STATES ---
  const [reportBatchId, setReportBatchId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  // Fetch students when batch changes in MARK mode
  useEffect(() => {
    if (activeTab === 'mark' && selectedBatchId) {
      fetchBatchStudents(selectedBatchId);
    } else {
      setStudents([]);
    }
  }, [selectedBatchId, activeTab]);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
    } catch (err) {
      console.error("Failed to fetch batches", err);
    }
  };

  const fetchBatchStudents = async (batchId) => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance/batch/${batchId}`);
      setStudents(response.data.students || []);
      setAbsentIds([]); 
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReport = async () => {
    if (!reportBatchId) return;
    setLoadingReport(true);
    setReportData(null);
    try {
      const response = await api.get(`/attendance?batchId=${reportBatchId}&date=${reportDate}`);
      setReportData(response.data);
    } catch (err) {
      console.error("Failed to fetch report", err);
    } finally {
      setLoadingReport(false);
    }
  };

  const toggleAbsent = (studentId) => {
    setAbsentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      const formatTime = (t) => {
        const [h, m] = t.split(':');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${m} ${ampm}`;
      };

      const response = await api.post('/attendance', {
        batchId: selectedBatchId,
        date: attendanceDate,
        startTime: formatTime(times.start),
        endTime: formatTime(times.end),
        session: session,
        absentStudentIds: absentIds
      });

      if (response.status === 201) {
        setMsg({ 
          type: 'success', 
          text: `Attendance marked! Present: ${response.data.metrics.totalPresent}, Absent: ${response.data.metrics.totalAbsent}` 
        });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to mark attendance' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'mark' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('mark')}
        >
          Mark Attendance
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'report' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('report')}
        >
          View History & Reports
        </button>
      </div>

      {activeTab === 'mark' ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-indigo-600" />
            New Session
          </h2>

          {msg.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.type === 'success' ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {msg.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
              <select 
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
              >
                <option value="">-- Choose Batch --</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name} (Class {b.className})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select 
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                <input type="time" className="w-full rounded-md border border-gray-300 py-2 px-1 text-sm" value={times.start} onChange={e => setTimes({...times, start: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                <input type="time" className="w-full rounded-md border border-gray-300 py-2 px-1 text-sm" value={times.end} onChange={e => setTimes({...times, end: e.target.value})} />
              </div>
            </div>
          </div>

          {selectedBatchId && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Student List ({students.length})</h3>
                <div className="text-sm text-gray-500">
                  <span className="text-red-600 font-bold">{absentIds.length} Absent</span> / <span className="text-green-600 font-bold">{students.length - absentIds.length} Present</span>
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No students in this batch.</div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                      <tr>
                        <th className="px-6 py-3">Register No</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map(student => {
                        const isAbsent = absentIds.includes(student._id);
                        return (
                          <tr key={student._id} className={isAbsent ? "bg-red-50" : "hover:bg-gray-50"}>
                            <td className="px-6 py-3 text-sm text-gray-900">{student.registerNumber}</td>
                            <td className="px-6 py-3 text-sm font-medium text-gray-700">{student.firstName} {student.lastName}</td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => toggleAbsent(student._id)}
                                className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${
                                  isAbsent 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {isAbsent ? 'Absent' : 'Present'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || students.length === 0}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit Attendance'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // --- REPORT VIEW ---
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
              <select 
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={reportBatchId}
                onChange={(e) => setReportBatchId(e.target.value)}
              >
                <option value="">-- Choose Batch --</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name} (Class {b.className})</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <button
              onClick={fetchAttendanceReport}
              disabled={!reportBatchId || loadingReport}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 h-10 w-full md:w-auto"
            >
              {loadingReport ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Get Report'}
            </button>
          </div>

          {/* Results */}
          {reportData && (
            <div className="space-y-6">
              {reportData.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
                  No attendance records found for this date.
                </div>
              ) : (
                reportData.map(record => (
                  <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{record.session} Session</h3>
                        <p className="text-xs text-gray-500">{record.startTime} - {record.endTime}</p>
                      </div>
                      <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">Taken by: {record.takenBy?.name || 'Admin'}</span>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-100">
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                          <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium">Present</p>
                          <p className="text-2xl font-bold text-green-800">{record.metrics.totalPresent}</p>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-full text-red-600">
                          <UserX className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Absent</p>
                          <p className="text-2xl font-bold text-red-800">{record.metrics.totalAbsent}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Lists Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                      {/* Present List */}
                      <div className="p-4">
                        <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Present List
                        </h4>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                          {record.records.filter(r => r.status === 'Present').map(r => (
                            <div key={r.studentId} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                              <span className="font-medium text-gray-700">{r.name}</span>
                              <span className="text-gray-400 text-xs">{r.registerNumber}</span>
                            </div>
                          ))}
                          {record.metrics.totalPresent === 0 && <p className="text-sm text-gray-400 italic">No students present</p>}
                        </div>
                      </div>

                      {/* Absent List */}
                      <div className="p-4">
                        <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                          <XCircle className="h-4 w-4" /> Absent List
                        </h4>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                          {record.records.filter(r => r.status === 'Absent').map(r => (
                            <div key={r.studentId} className="text-sm bg-red-50 p-2 rounded flex justify-between border border-red-100">
                              <span className="font-medium text-red-800">{r.name}</span>
                              <span className="text-red-400 text-xs">{r.registerNumber}</span>
                            </div>
                          ))}
                          {record.metrics.totalAbsent === 0 && <p className="text-sm text-gray-400 italic">No students absent</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AttendanceManager;