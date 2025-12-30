import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Loader2, Trash2, FileText, PlusCircle, X, Save, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
const ExamManager = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'grading', 'results'
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // --- Create Exam State ---
  const [examForm, setExamForm] = useState({
    name: '',
    batchId: '',
    scheduledDate: '',
    duration: '',
    subjects: [{ name: '', maxMarks: 100, passMarks: 40 }] 
  });

  // --- Grading/Results State ---
  const [examsList, setExamsList] = useState([]); 
  const [selectedExam, setSelectedExam] = useState(null); 
  const [gradingStudents, setGradingStudents] = useState([]); 
  const [existingResults, setExistingResults] = useState([]); 
  
  // --- Popup State ---
  const [studentToGrade, setStudentToGrade] = useState(null); 
  const [marksEntry, setMarksEntry] = useState({}); 

  useEffect(() => {
    fetchBatches();
    fetchExams(); // Fetch exams on mount
  }, []);

  // Fetch batches for dropdowns
  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
    } catch (err) { console.error(err); }
  };

  // Fetch Exams
  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      setExamsList(response.data);
    } catch (err) {
      console.error("Failed to fetch exams", err);
    }
  };

  // --- HANDLERS ---

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...examForm.subjects];
    newSubjects[index][field] = value;
    setExamForm({ ...examForm, subjects: newSubjects });
  };

  const addSubject = () => {
    setExamForm({ 
      ...examForm, 
      subjects: [...examForm.subjects, { name: '', maxMarks: 100, passMarks: 40 }] 
    });
  };

  const removeSubject = (index) => {
    const newSubjects = examForm.subjects.filter((_, i) => i !== index);
    setExamForm({ ...examForm, subjects: newSubjects });
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const response = await api.post('/exams', examForm);
      if (response.status === 201) {
        setMsg({ type: 'success', text: 'Exam created successfully!' });
        setExamForm({
          name: '',
          batchId: '',
          scheduledDate: '',
          duration: '',
          subjects: [{ name: '', maxMarks: 100, passMarks: 40 }]
        });
        
        fetchExams(); // Refresh the list from backend
        setActiveTab('list');
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to create exam' });
    } finally {
      setLoading(false);
    }
  };

  const loadExamData = async (exam) => {
    setLoading(true);
    try {
      const response = await api.get(`/exams/${exam._id}/grading-sheet`);
      setSelectedExam(response.data.examDetails);
      setGradingStudents(response.data.students);
      setExistingResults(response.data.existingResults || []);
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const openGradingView = async (exam) => {
    if (await loadExamData(exam)) {
      setActiveTab('grading');
    }
  };

  const openResultsView = async (exam) => {
    if (await loadExamData(exam)) {
      setActiveTab('results');
    }
  };

  const openMarkModal = (student) => {
    setStudentToGrade(student);
    
    // Check if marks already exist
    const existing = existingResults.find(r => r.studentId === student._id);
    if (existing) {
      // Pre-fill existing marks
      const marksMap = {};
      existing.subjectResults.forEach(sub => {
        marksMap[sub.subjectName] = sub.obtainedMarks;
      });
      setMarksEntry(marksMap);
    } else {
      // Empty marks
      setMarksEntry({});
    }
  };

  const saveMarks = async () => {
    if (!studentToGrade || !selectedExam) return;
    
    try {
      const payload = {
        examId: selectedExam._id,
        studentMarks: [
          {
            studentId: studentToGrade._id,
            isAbsent: false, 
            obtainedMarks: marksEntry
          }
        ]
      };

      await api.post('/exams/marks', payload);
      
      // Update local state to reflect change (turn green)
      // Since backend doesn't return the full result object on bulk save, 
      // we just optimistically update the 'existingResults' list to show UI feedback.
      // For accurate 'Results' tab data, we rely on the fact that if we revisit it, it re-fetches.
      // But for current view, we need minimal update.
      
      // Re-fetch data to get calculations (percent/total) from backend logic 
      // This is safer than calculating locally for the table view update
      const response = await api.get(`/exams/${selectedExam._id}/grading-sheet`);
      setExistingResults(response.data.existingResults || []);
      
      setStudentToGrade(null); 
      setMarksEntry({});
    } catch (err) {
      alert("Failed to save marks");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'list' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('list')}
        >
          Exam List
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'create' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('create')}
        >
          Create Exam
        </button>
        {(activeTab === 'grading' || activeTab === 'results') && (
          <button className="px-6 py-3 font-medium text-sm border-b-2 border-indigo-600 text-indigo-600">
            {activeTab === 'grading' ? 'Grading Mode' : 'Result Report'} : {selectedExam?.name}
          </button>
        )}
      </div>

      {/* CREATE EXAM VIEW */}
      {activeTab === 'create' && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" /> Create New Exam
          </h2>
          
          {msg.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.type === 'success' ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {msg.text}
            </div>
          )}

          <form onSubmit={handleCreateExam} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                <input type="text" required className="mt-1 w-full rounded-md border border-gray-300 py-2 px-3" placeholder="Mid Term Exam" value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch</label>
                <select required className="mt-1 w-full rounded-md border border-gray-300 py-2 px-3" value={examForm.batchId} onChange={e => setExamForm({...examForm, batchId: e.target.value})}>
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.name} (Class {b.className})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" required className="mt-1 w-full rounded-md border border-gray-300 py-2 px-3" value={examForm.scheduledDate} onChange={e => setExamForm({...examForm, scheduledDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input type="text" required className="mt-1 w-full rounded-md border border-gray-300 py-2 px-3" placeholder="2 Hours" value={examForm.duration} onChange={e => setExamForm({...examForm, duration: e.target.value})} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Subjects & Marks</h3>
              {examForm.subjects.map((sub, index) => (
                <div key={index} className="flex gap-4 mb-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Subject</label>
                    <input type="text" required className="w-full rounded-md border border-gray-300 py-1 px-2" placeholder="Maths" value={sub.name} onChange={e => handleSubjectChange(index, 'name', e.target.value)} />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-gray-500">Max Marks</label>
                    <input type="number" required className="w-full rounded-md border border-gray-300 py-1 px-2" value={sub.maxMarks} onChange={e => handleSubjectChange(index, 'maxMarks', e.target.value)} />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-gray-500">Pass Marks</label>
                    <input type="number" required className="w-full rounded-md border border-gray-300 py-1 px-2" value={sub.passMarks} onChange={e => handleSubjectChange(index, 'passMarks', e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeSubject(index)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addSubject} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"><PlusCircle className="h-4 w-4" /> Add Subject</button>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXAM LIST VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-700 text-sm">
            Recent exams you created will appear here. Select one to start grading or view report.
          </div>
          {examsList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No recent exams found. Create one to get started.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examsList.map(exam => (
                <div key={exam._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-50 p-3 rounded-lg"><FileText className="h-6 w-6 text-purple-600" /></div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{new Date(exam.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{exam.name}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{exam.subjects.length} Subjects</span>
                    <span>{exam.batchId?.name || 'Batch'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openGradingView(exam)} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      Enter Marks
                    </button>
                    <button onClick={() => openResultsView(exam)} className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GRADING VIEW */}
      {activeTab === 'grading' && selectedExam && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Grading: {selectedExam.name}</h2>
              <p className="text-xs text-gray-500">Click on a student to enter marks.</p>
            </div>
            <button onClick={() => setActiveTab('list')} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {gradingStudents.map(student => {
              const hasMarks = existingResults.some(r => r.studentId === student._id);
              return (
                <div 
                  key={student._id} 
                  onClick={() => openMarkModal(student)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md flex items-center justify-between ${hasMarks ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${hasMarks ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {student.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{student.firstName}</p>
                      <p className="text-xs text-gray-500">{student.registerNumber}</p>
                    </div>
                  </div>
                  {hasMarks && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULTS / REPORT VIEW */}
      {activeTab === 'results' && selectedExam && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Exam Report: {selectedExam.name}</h2>
              <p className="text-xs text-gray-500">Batch: {selectedExam.batchId?.name} | Date: {new Date(selectedExam.scheduledDate).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('grading')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Edit Marks</button>
              <button onClick={() => setActiveTab('list')} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b">Register No</th>
                  <th className="px-6 py-4 border-b">Student Name</th>
                  {/* Dynamic Subject Headers */}
                  {selectedExam.subjects.map((sub, idx) => (
                    <th key={idx} className="px-6 py-4 border-b text-center">{sub.name} <br/><span className="text-xxs text-gray-400">({sub.maxMarks})</span></th>
                  ))}
                  <th className="px-6 py-4 border-b text-center">Total</th>
                  <th className="px-6 py-4 border-b text-center">%</th>
                  <th className="px-6 py-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {gradingStudents.map(student => {
                  const result = existingResults.find(r => r.studentId === student._id);
                  
                  return (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-500">{student.registerNumber}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{student.firstName} {student.lastName}</td>
                      
                      {/* Dynamic Subject Marks */}
                      {selectedExam.subjects.map((sub, idx) => {
                        const subResult = result?.subjectResults?.find(s => s.subjectName === sub.name);
                        return (
                          <td key={idx} className="px-6 py-4 text-center">
                            {result ? (
                              <span className={subResult?.passStatus === 'Fail' ? 'text-red-600 font-bold' : 'text-gray-700'}>
                                {subResult ? subResult.obtainedMarks : '-'}
                              </span>
                            ) : '-'}
                          </td>
                        );
                      })}

                      <td className="px-6 py-4 text-center font-bold">{result ? result.totalObtainedMarks : '-'}</td>
                      <td className="px-6 py-4 text-center">{result ? `${result.percentage}%` : '-'}</td>
                      <td className="px-6 py-4 text-center">
                        {result ? (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${result.resultStatus === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {result.resultStatus}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MARK ENTRY MODAL */}
      {studentToGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{studentToGrade.firstName} {studentToGrade.lastName}</h3>
                <p className="text-xs text-gray-500">{studentToGrade.registerNumber}</p>
              </div>
              <button onClick={() => setStudentToGrade(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedExam.subjects.map((sub, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{sub.name}</p>
                    <p className="text-xs text-gray-500">Max: {sub.maxMarks}</p>
                  </div>
                  <input 
                    type="number" 
                    className="w-24 rounded-md border border-gray-300 py-1 px-3 text-center font-bold text-indigo-700 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="-"
                    value={marksEntry[sub.name] || ''}
                    onChange={(e) => setMarksEntry({...marksEntry, [sub.name]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setStudentToGrade(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={saveMarks} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Marks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExamManager;