import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users,  LogOut, User, School, UserPlus, X, 
  Menu, GraduationCap, Loader2, CheckCircle2, BookOpen, FileText, Clock, ChevronRight, ArrowLeft, CreditCard, DollarSign } from 'lucide-react';
import api from '../utils/api';
import AttendanceManager from '../components/AttendanceManager';
import ExamManager from './ExamManager';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data States
  const [pendingStudents, setPendingStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  
  // Forms
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [batchForm, setBatchForm] = useState({ name: '', className: '' });
  
  // Fee Management State
  const [feeViewTab, setFeeViewTab] = useState('overview'); // 'overview' | 'setup'
  const [feeForm, setFeeForm] = useState({ batchId: '', monthlyFee: '', selectedMonths: [] });
  const [submittingFee, setSubmittingFee] = useState(false);
  const [feeMsg, setFeeMsg] = useState({ type: '', text: '' });
  
  // Fee Stats State
  const [statBatchId, setStatBatchId] = useState('');
  const [feeStats, setFeeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Batch Create/Edit States
  const [batchViewMode, setBatchViewMode] = useState('list');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Loading States
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAllStudents, setLoadingAllStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingTeacher, setSubmittingTeacher] = useState(false);
  
  // Messages
  const [teacherMsg, setTeacherMsg] = useState({ type: '', text: '' });
  const [batchMsg, setBatchMsg] = useState({ type: '', text: '' });

  const ALL_MONTHS = ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !userData) { navigate('/login'); } else { setUser(JSON.parse(userData)); }
  }, [navigate]);

  // Fetch Data based on view
  useEffect(() => {
    if (activeView === 'approvals') fetchPendingStudents();
    else if (activeView === 'teachers') fetchTeachers();
    else if (activeView === 'batches') fetchBatches();
    else if (activeView === 'students') fetchAllStudents();
    else if (activeView === 'fees') fetchBatches(); // Need batches for fee dropdown
  }, [activeView]);

  useEffect(() => {
    if ((batchViewMode === 'create' || batchViewMode === 'edit') && batchForm.className) {
      fetchStudentsForBatchClass(batchForm.className);
    }
  }, [batchForm.className, batchViewMode]);

  // Fetch Fee Stats when batch is selected
  useEffect(() => {
    if (activeView === 'fees' && feeViewTab === 'overview' && statBatchId) {
      fetchFeeStats(statBatchId);
    }
  }, [statBatchId, feeViewTab, activeView]);

  // --- Fetch Functions ---
  const fetchPendingStudents = async () => { setLoadingPending(true); try { const response = await api.get('/students/pending'); if(Array.isArray(response.data)) setPendingStudents(response.data); } catch (err) { console.error(err); } finally { setLoadingPending(false); } };
  const fetchTeachers = async () => { setLoadingTeachers(true); try { const response = await api.get('/teachers'); if(Array.isArray(response.data)) setTeachers(response.data); } catch (err) { console.error(err); } finally { setLoadingTeachers(false); } };
  const fetchBatches = async () => { setLoadingBatches(true); try { const response = await api.get('/batches'); if(Array.isArray(response.data)) setBatches(response.data); } catch (err) { console.error(err); } finally { setLoadingBatches(false); } };
  const fetchAllStudents = async () => { setLoadingAllStudents(true); try { const response = await api.get('/students'); if(Array.isArray(response.data)) setAllStudents(response.data); } catch (err) { console.error(err); } finally { setLoadingAllStudents(false); } };
  const fetchStudentsForBatchClass = async (className) => { setLoadingStudents(true); try { const response = await api.get(`/batches/students?className=${className}`); setAvailableStudents(response.data); } catch (err) { console.error(err); } finally { setLoadingStudents(false); } };
  
  const fetchFeeStats = async (bId) => {
    setLoadingStats(true);
    try {
      const response = await api.get(`/fees/admin/stats?batchId=${bId}`);
      setFeeStats(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // --- Action Handlers ---
  const approveStudent = async (studentId) => { try { const response = await api.put(`/students/approve/${studentId}`, {}); if (response.status === 200) { setPendingStudents(prev => prev.filter(s => s._id !== studentId)); alert("Student Approved Successfully!"); } } catch (err) { alert("Error approving student"); } };
  const handleTeacherSubmit = async (e) => { e.preventDefault(); setSubmittingTeacher(true); setTeacherMsg({ type: '', text: '' }); try { const response = await api.post('/teachers', teacherForm); if (response.status === 201) { setTeacherMsg({ type: 'success', text: 'Teacher created successfully!' }); setTeacherForm({ name: '', email: '', password: '' }); fetchTeachers(); } } catch (err) { setTeacherMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to create teacher' }); } finally { setSubmittingTeacher(false); } };
  const initCreateBatch = () => { setBatchForm({ name: '', className: 'V' }); setSelectedStudentIds([]); setBatchViewMode('create'); setBatchMsg({ type: '', text: '' }); };
  const initEditBatch = (batch) => { setSelectedBatch(batch); setBatchForm({ name: batch.name, className: batch.className }); setSelectedStudentIds([]); setBatchViewMode('edit'); setBatchMsg({ type: '', text: '' }); };
  const toggleStudentSelection = (studentId) => { setSelectedStudentIds(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]); };
  const handleBatchSubmit = async (e) => { e.preventDefault(); setSubmitting(true); setBatchMsg({ type: '', text: '' }); try { if (batchViewMode === 'create') { const response = await api.post('/batches', { name: batchForm.name, className: batchForm.className, studentIds: selectedStudentIds }); if (response.status === 201) { setBatchMsg({ type: 'success', text: 'Batch created successfully!' }); fetchBatches(); setTimeout(() => setBatchViewMode('list'), 1500); } } else if (batchViewMode === 'edit') { const response = await api.put(`/batches/${selectedBatch._id}`, { name: batchForm.name, studentIds: selectedStudentIds }); if (response.status === 200) { setBatchMsg({ type: 'success', text: 'Batch updated successfully!' }); fetchBatches(); setTimeout(() => setBatchViewMode('list'), 1500); } } } catch (err) { setBatchMsg({ type: 'error', text: err.response?.data?.msg || 'Operation failed' }); } finally { setSubmitting(false); } };
  const toggleMonthSelection = (month) => { setFeeForm(prev => { const newMonths = prev.selectedMonths.includes(month) ? prev.selectedMonths.filter(m => m !== month) : [...prev.selectedMonths, month]; return { ...prev, selectedMonths: newMonths }; }); };
  const handleFeeSubmit = async (e) => { e.preventDefault(); if (!feeForm.batchId || !feeForm.monthlyFee || feeForm.selectedMonths.length === 0) { setFeeMsg({ type: 'error', text: 'Please fill all fields.' }); return; } setSubmittingFee(true); setFeeMsg({ type: '', text: '' }); try { const response = await api.post('/fees/structure', { batchId: feeForm.batchId, monthlyFee: Number(feeForm.monthlyFee), academicMonths: feeForm.selectedMonths }); if (response.status === 201) { setFeeMsg({ type: 'success', text: 'Fee structure assigned!' }); setFeeForm({ batchId: '', monthlyFee: '', selectedMonths: [] }); } } catch (err) { setFeeMsg({ type: 'error', text: err.response?.data?.msg || 'Failed' }); } finally { setSubmittingFee(false); } };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); navigate('/login'); };

  if (!user) return null;

  // --- Render Views ---

  // ... (Approvals, Teachers, Batches, Students Views remain identical to previous - skipping large block repetition) ...
  const renderDashboardView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-4"><div className="bg-blue-50 p-3 rounded-lg"><Users className="h-6 w-6 text-blue-600" /></div><span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12%</span></div><h3 className="text-gray-500 text-sm font-medium">Total Students</h3><p className="text-3xl font-bold text-gray-900">1,240</p></div>
        {/* Placeholder cards for other stats */}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block p-4 bg-gray-50 rounded-full mb-4"><BarChart3 className="h-12 w-12 text-gray-400" /></div>
        <h3 className="text-lg font-bold text-gray-900">Welcome to your Dashboard</h3>
      </div>
    </>
  );

  const renderApprovalsView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-lg font-bold text-gray-900">Pending Student Approvals</h2><button onClick={() => { setLoadingPending(true); api.get('/students/pending').then(res => setPendingStudents(res.data)).finally(() => setLoadingPending(false)); }} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button></div>
      {loadingPending ? <div className="p-12 text-center">Loading...</div> : (
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-600 text-xs uppercase"><tr><th className="px-6 py-4">Register No</th><th className="px-6 py-4">Name</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{pendingStudents.map(s => (<tr key={s._id}><td className="px-6 py-4">{s.registerNumber}</td><td className="px-6 py-4">{s.firstName} {s.lastName}</td><td className="px-6 py-4 text-right"><button onClick={() => approveStudent(s._id)} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">Approve</button></td></tr>))}</tbody></table></div>
      )}
    </div>
  );

  const renderTeachersView = () => (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h2 className="text-lg font-bold mb-4">Add Teacher</h2><form onSubmit={handleTeacherSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6"><input type="text" className="border p-2 rounded" placeholder="Name" value={teacherForm.name} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} /><input type="email" className="border p-2 rounded" placeholder="Email" value={teacherForm.email} onChange={e => setTeacherForm({...teacherForm, email: e.target.value})} /><input type="password" className="border p-2 rounded" placeholder="Password" value={teacherForm.password} onChange={e => setTeacherForm({...teacherForm, password: e.target.value})} /><button type="submit" disabled={submittingTeacher} className="bg-indigo-600 text-white p-2 rounded md:col-span-2">Add Teacher</button></form></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h2 className="text-lg font-bold mb-4">Staff List</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>{teachers.map(t => <tr key={t._id}><td>{t.name}</td><td>{t.email}</td></tr>)}</tbody></table></div></div>
    </div>
  );

  const renderBatchesView = () => {
    if (batchViewMode === 'list') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900">Batches</h2><button onClick={initCreateBatch} className="bg-indigo-600 text-white px-4 py-2 rounded">Create Batch</button></div>
          {loadingBatches ? <div className="text-center py-12 text-gray-500">Loading batches...</div> : batches.length === 0 ? <div className="bg-white p-12 rounded-xl text-center border border-gray-200"><BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">No batches yet</h3></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{batches.map(batch => (<div key={batch._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors group relative"><div className="flex justify-between items-start mb-4"><div className="bg-orange-50 p-3 rounded-lg"><GraduationCap className="h-6 w-6 text-orange-600" /></div><span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Class {batch.className}</span></div><h3 className="text-lg font-bold text-gray-900 mb-1">{batch.name}</h3><p className="text-gray-500 text-sm mb-4">{batch.students?.length || 0} Students</p><button onClick={() => initEditBatch(batch)} className="w-full py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2">View & Edit Students <ChevronRight className="h-4 w-4" /></button></div>))}</div>
          )}
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={() => setBatchViewMode('list')} className="text-gray-500 hover:text-gray-700"><ArrowLeft className="h-6 w-6" /></button><h2 className="text-lg font-bold text-gray-900">{batchViewMode === 'create' ? 'Create New Batch' : `Edit ${selectedBatch?.name}`}</h2></div></div>
        <div className="p-6">
          {batchMsg.text && <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${batchMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{batchMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}{batchMsg.text}</div>}
          <form onSubmit={handleBatchSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-gray-700">Batch Name</label><input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={batchForm.name} onChange={(e) => setBatchForm({...batchForm, name: e.target.value})} placeholder="Ex: Class X - Morning" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Class</label><select required disabled={batchViewMode === 'edit'} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" value={batchForm.className} onChange={(e) => setBatchForm({...batchForm, className: e.target.value})}><option value="">Select Class</option>{['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            {batchViewMode === 'edit' && selectedBatch?.students?.length > 0 && (<div className="border rounded-md p-4 bg-indigo-50 border-indigo-100"><h3 className="text-sm font-bold text-indigo-900 mb-3">Students Currently in Batch</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{selectedBatch.students.map(s => (<div key={s._id} className="flex items-center gap-2 text-sm text-indigo-800"><CheckCircle2 className="h-4 w-4 text-indigo-600" /> {s.firstName} {s.lastName} <span className="opacity-70">({s.registerNumber})</span></div>))}</div></div>)}
            {batchForm.className && (<div className="border rounded-md p-4 bg-gray-50"><h3 className="text-sm font-medium text-gray-700 mb-3 flex justify-between items-center"><span>{batchViewMode === 'create' ? 'Select Students' : 'Add New Students'}</span><span className="text-xs text-gray-500">{selectedStudentIds.length} Selected</span></h3>{loadingStudents ? <div className="text-center py-4 text-gray-500">Loading students...</div> : availableStudents.length === 0 ? <div className="text-center py-4 text-gray-500 text-sm">No new students found in Class {batchForm.className}.</div> : (<div className="max-h-48 overflow-y-auto space-y-2 bg-white p-2 rounded border border-gray-200">{availableStudents.filter(s => batchViewMode === 'create' || !selectedBatch.students.some(existing => existing._id === s._id)).map(student => (<div key={student._id} className={`flex items-center gap-3 p-2 rounded cursor-pointer border ${selectedStudentIds.includes(student._id) ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50 border-transparent'}`} onClick={() => toggleStudentSelection(student._id)}><input type="checkbox" checked={selectedStudentIds.includes(student._id)} onChange={() => {}} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><div><p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p><p className="text-xs text-gray-500">Reg: {student.registerNumber}</p></div></div>))}</div>)}</div>)}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setBatchViewMode('list')} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button><button type="submit" disabled={submitting} className="flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">{submitting ? <Loader2 className="animate-spin h-5 w-5" /> : (batchViewMode === 'create' ? 'Create Batch' : 'Update Batch')}</button></div>
          </form>
        </div>
      </div>
    );
  };

  const renderStudentsView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-lg font-bold text-gray-900">Registered Students</h2><button onClick={fetchAllStudents} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button></div>
      {loadingAllStudents ? <div className="p-12 text-center text-gray-500">Loading student records...</div> : allStudents.length === 0 ? <div className="p-12 text-center text-gray-500">No students found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold"><tr><th className="px-6 py-4">Register No</th><th className="px-6 py-4">Full Name</th><th className="px-6 py-4">Class</th><th className="px-6 py-4">Phone</th></tr></thead><tbody className="divide-y divide-gray-100">{allStudents.map((student) => (<tr key={student._id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-medium text-gray-900">{student.registerNumber}</td><td className="px-6 py-4 text-gray-600 font-medium">{student.firstName} {student.lastName}</td><td className="px-6 py-4 text-gray-500 text-sm">{student.className || '-'}</td><td className="px-6 py-4 text-gray-500 text-sm">{student.phoneNumber || '-'}</td></tr>))}</tbody></table></div>
      )}
    </div>
  );

  // --- UPDATED FEES VIEW WITH DASHBOARD ---
  const renderFeesView = () => (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button className={`px-6 py-3 font-medium text-sm transition-colors ${feeViewTab === 'overview' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFeeViewTab('overview')}>Overview & Reports</button>
        <button className={`px-6 py-3 font-medium text-sm transition-colors ${feeViewTab === 'setup' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFeeViewTab('setup')}>Setup Fee Structure</button>
      </div>

      {feeViewTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Batch to View Reports</h3>
            <select className="w-full md:w-1/3 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={statBatchId} onChange={(e) => setStatBatchId(e.target.value)}>
              <option value="">-- Choose Batch --</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name} (Class {b.className})</option>)}
            </select>
          </div>

          {loadingStats && <div className="p-12 text-center text-gray-500">Loading statistics...</div>}

          {!loadingStats && feeStats && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-2"><div className="bg-blue-50 p-2 rounded-lg"><CreditCard className="h-5 w-5 text-blue-600" /></div><span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Expected</span></div><p className="text-sm text-gray-500">Total Fees</p><p className="text-2xl font-bold text-gray-900">₹{feeStats.totalExpected}</p></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-2"><div className="bg-green-50 p-2 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Collected</span></div><p className="text-sm text-gray-500">Total Paid</p><p className="text-2xl font-bold text-green-700">₹{feeStats.totalCollected}</p></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-2"><div className="bg-red-50 p-2 rounded-lg"><Clock className="h-5 w-5 text-red-600" /></div><span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">Pending</span></div><p className="text-sm text-gray-500">Total Dues</p><p className="text-2xl font-bold text-red-700">₹{feeStats.totalPending}</p></div>
              </div>

              {/* Unpaid Students Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Pending Dues List</h2></div>
                {feeStats.unpaidStudents.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No pending dues for this batch.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-4">Register No</th>
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Pending Amount</th>
                          <th className="px-6 py-4">Months Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {feeStats.unpaidStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900">{s.registerNumber}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-700">{s.name}</td>
                            <td className="px-6 py-4 text-sm font-bold text-red-600">₹{s.pendingAmount}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              <div className="flex flex-wrap gap-1">
                                {s.pendingMonths.slice(0, 3).map(m => <span key={m} className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">{m}</span>)}
                                {s.pendingMonths.length > 3 && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">+{s.pendingMonths.length - 3} more</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {feeViewTab === 'setup' && (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Setup Fee Structure</h2>
          {feeMsg.text && <div className={`mb-4 p-2 rounded ${feeMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{feeMsg.text}</div>}
          <form onSubmit={handleFeeSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div><label className="block mb-1 text-sm font-medium">Batch</label><select className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={feeForm.batchId} onChange={e => setFeeForm({...feeForm, batchId: e.target.value})}><option value="">Select Batch</option>{batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</select></div>
              <div><label className="block mb-1 text-sm font-medium">Monthly Fee</label><input type="number" className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={feeForm.monthlyFee} onChange={e => setFeeForm({...feeForm, monthlyFee: e.target.value})} /></div>
            </div>
            <div><label className="block mb-2 text-sm font-medium">Months</label><div className="grid grid-cols-4 gap-2">{ALL_MONTHS.map(m => <div key={m} onClick={() => toggleMonthSelection(m)} className={`border p-2 text-center cursor-pointer rounded transition-colors ${feeForm.selectedMonths.includes(m) ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}>{m}</div>)}</div></div>
            <button type="submit" disabled={submittingFee} className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">Set Fee</button>
          </form>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200"><div className="flex items-center gap-2 text-indigo-600"><School className="h-8 w-8" /><span className="text-xl font-bold">EduManager</span></div><button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button></div>
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><LayoutDashboard className="h-5 w-5" /> Dashboard</button>
          <button onClick={() => { setActiveView('approvals'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'approvals' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><UserPlus className="h-5 w-5" /> Pending Approvals</button>
          <button onClick={() => { setActiveView('teachers'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'teachers' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><GraduationCap className="h-5 w-5" /> Teachers</button>
          <button onClick={() => { setActiveView('batches'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'batches' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><BookOpen className="h-5 w-5" /> Batches</button>
          <button onClick={() => { setActiveView('students'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'students' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><Users className="h-5 w-5" /> Students</button>
          <button onClick={() => { setActiveView('attendance'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'attendance' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><CheckCircle2 className="h-5 w-5" /> Attendance</button>
          <button onClick={() => { setActiveView('exams'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'exams' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><FileText className="h-5 w-5" /> Exams</button>
          <button onClick={() => { setActiveView('fees'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'fees' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><CreditCard className="h-5 w-5" /> Fees</button>
        </div>
        <div className="p-4 border-t border-gray-200"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors"><LogOut className="h-5 w-5" /> Sign Out</button></div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
           <div className="flex items-center gap-4"><button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700"><Menu className="h-6 w-6" /></button><h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{activeView === 'dashboard' && 'Overview'}{activeView === 'approvals' && 'Approvals'}{activeView === 'teachers' && 'Manage Teachers'}{activeView === 'batches' && 'Manage Batches'}{activeView === 'students' && 'Students Directory'}{activeView === 'attendance' && 'Mark Attendance'}{activeView === 'exams' && 'Exams & Grading'}{activeView === 'fees' && 'Fee Management'}</h1></div>
           <div className="flex items-center gap-4"><div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200"><div className="bg-indigo-100 p-2 rounded-full hidden sm:block"><User className="h-5 w-5 text-indigo-600" /></div><div><p className="text-sm font-bold text-gray-900">{user.name}</p><p className="text-xs text-gray-500 capitalize hidden sm:block">Admin</p></div></div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {activeView === 'dashboard' && <div className="p-12 text-center text-gray-500">Dashboard Overview (Placeholder)</div>}
           {activeView === 'approvals' && renderApprovalsView()}
           {activeView === 'teachers' && renderTeachersView()}
           {activeView === 'batches' && renderBatchesView()}
           {activeView === 'students' && renderStudentsView()}
           {activeView === 'attendance' && <AttendanceManager />}
           {activeView === 'exams' && <ExamManager />}
           {activeView === 'fees' && renderFeesView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard