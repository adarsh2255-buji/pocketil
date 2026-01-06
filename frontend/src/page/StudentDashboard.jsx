import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, User, CheckCircle2, CreditCard, FileText, School,
  LogOut, X, Menu, Camera, Edit,Check, BarChart3, Minus, Award, AlertTriangle, ChevronRight, ArrowLeft, Calendar, BookOpenCheck, Bell  } from 'lucide-react';
import ProfileEditModal from '../components/ProfileEditModel';
import api from '../utils/api';
import StudentFeeManager from '../components/StudentFeeManager';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Attendance State
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, totalDays: 0, presentCount: 0, lastStatus: 'N/A' });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Exam State
  const [examResults, setExamResults] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [selectedExamResult, setSelectedExamResult] = useState(null); 

  // Fee State (For Notifications)
  const [feeSummary, setFeeSummary] = useState(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);

  // Attendance Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !userData || role !== 'student') {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchFullProfile();
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchAttendance();
      fetchExamResults();
      fetchFees();
    }
  }, [user]);

  // Generate Notifications when data changes
  useEffect(() => {
    const newNotifs = [];

    // 1. Fee Alert
    if (feeSummary && feeSummary.remainingFee > 0) {
        newNotifs.push({
            id: 'fee-1',
            type: 'urgent',
            title: 'Fee Payment Due',
            message: `You have a pending balance of ₹${feeSummary.remainingFee}. Please pay immediately.`,
            date: new Date(),
            icon: CreditCard,
            color: 'text-red-600 bg-red-50 border-red-100'
        });
    }

    // 2. Absent Alert
    if (attendanceStats.lastStatus === 'Absent') {
         newNotifs.push({
            id: 'att-1',
            type: 'warning',
            title: 'Absent Alert',
            message: 'You were marked absent for the last session.',
            date: new Date(),
            icon: AlertTriangle,
            color: 'text-orange-600 bg-orange-50 border-orange-100'
        });
    }

    // 3. Exam Published
    if (examResults.length > 0) {
        // Assume the first one is the latest
        newNotifs.push({
             id: 'exam-1',
             type: 'info',
             title: 'Exam Result Published',
             message: `Results for ${examResults[0].examId.name} are out.`,
             date: new Date(examResults[0].createdAt || Date.now()), 
             icon: FileText,
             color: 'text-blue-600 bg-blue-50 border-blue-100'
        });
    }
    
    // 4. Admin Message (Static Placeholder)
    newNotifs.push({
        id: 'admin-1',
        type: 'info',
        title: 'Admin Message',
        message: 'School will be closed this Friday.',
        date: new Date(),
        icon: School,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    });

    setNotifications(newNotifs);

  }, [feeSummary, attendanceStats, examResults]);

  const fetchFullProfile = async () => {
    try {
      const response = await api.get('/students/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) { console.error("Failed to fetch full profile", err); }
  };

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const response = await api.get('/attendance/my-history');
      setAttendanceStats(response.data.stats);
      setAttendanceHistory(response.data.history);
    } catch (err) { console.error("Failed to fetch attendance", err); } finally { setLoadingAttendance(false); }
  };

  const fetchExamResults = async () => {
    setLoadingExams(true);
    try {
      const response = await api.get('/exams/my-results');
      setExamResults(response.data);
    } catch (err) { console.error("Failed to fetch exams", err); } finally { setLoadingExams(false); }
  };

  const fetchFees = async () => {
    try {
      const response = await api.get('/fees/my-fees');
      setFeeSummary(response.data);
    } catch (err) { console.error("Failed to fetch fees", err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Helpers
  const getAttColor = (pct) => {
    const val = parseFloat(pct);
    if (val >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600' };
    if (val >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-600' };
    return { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' };
  };

  const getFilteredAttendance = () => {
    return attendanceHistory.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
    });
  };

  // Analyze Academic Performance (Dashboard Widget)
  const analyzePerformance = () => {
    if (!examResults || examResults.length === 0) return null;
    const latest = examResults[0]; 
    let bestSub = null, weakSub = null, maxPct = -1, minPct = 101;

    latest.subjectResults.forEach(sub => {
      const pct = (sub.obtainedMarks / sub.maxMarks) * 100;
      if (pct > maxPct) { maxPct = pct; bestSub = sub; }
      if (pct < minPct) { minPct = pct; weakSub = sub; }
    });

    let trend = 'flat';
    if (examResults.length > 1) {
      const prev = examResults[1];
      if (latest.percentage > prev.percentage) trend = 'up';
      else if (latest.percentage < prev.percentage) trend = 'down';
    }

    return { latest, bestSub, weakSub, trend };
  };

  // Calculate Overall Stats for Exam Tab
  const getOverallPerformance = () => {
    if (!examResults || examResults.length === 0) return null;

    const totalExams = examResults.length;
    const overallAvg = (examResults.reduce((sum, r) => sum + r.percentage, 0) / totalExams).toFixed(1);

    const subjectMap = {};
    examResults.forEach(exam => {
        exam.subjectResults.forEach(sub => {
            if(!subjectMap[sub.subjectName]) subjectMap[sub.subjectName] = { obtained: 0, max: 0 };
            subjectMap[sub.subjectName].obtained += sub.obtainedMarks;
            subjectMap[sub.subjectName].max += sub.maxMarks;
        });
    });

    let bestSubject = { name: '-', pct: -1 };
    let weakestSubject = { name: '-', pct: 101 };

    Object.keys(subjectMap).forEach(key => {
        const pct = (subjectMap[key].obtained / subjectMap[key].max) * 100;
        if (pct > bestSubject.pct) bestSubject = { name: key, pct };
        if (pct < weakestSubject.pct) weakestSubject = { name: key, pct };
    });

    return { overallAvg, totalExams, bestSubject: bestSubject.name, weakestSubject: weakestSubject.name };
  };

  // --- FEE STATUS LOGIC ---
  const getNextDueMonth = () => {
    if (!feeSummary || !feeSummary.monthlyStatus) return 'N/A';
    const nextDue = feeSummary.monthlyStatus.find(m => m.status === 'Due');
    return nextDue ? nextDue.month : 'All Clear';
  };
  
  const nextDueMonth = getNextDueMonth();
  const isFeeDue = feeSummary?.remainingFee > 0;

  if (!user) return null;
  
  const attColor = getAttColor(attendanceStats.percentage);
  const filteredHistory = getFilteredAttendance();
  const dashboardStats = analyzePerformance();
  const overallStats = getOverallPerformance();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200">
           <div className="flex items-center gap-2 text-indigo-600"><School className="h-8 w-8" /><span className="text-xl font-bold">EduStudent</span></div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); setSelectedExamResult(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => { setActiveView('notifications'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Bell size={20} /> Notifications
            {notifications.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{notifications.length}</span>}
          </button>
          <button onClick={() => { setActiveView('profile'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><User size={20} /> My Profile</button>
          <button onClick={() => { setActiveView('attendance'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'attendance' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><CheckCircle2 size={20} /> Attendance</button>
          <button onClick={() => { setActiveView('fees'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'fees' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><CreditCard size={20} /> Fees</button>
          <button onClick={() => { setActiveView('exams'); setIsSidebarOpen(false); setSelectedExamResult(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'exams' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><FileText size={20} /> Exam Results</button>
        </div>
        <div className="p-4 border-t border-gray-200"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors"><LogOut size={20} /> Sign Out</button></div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
           <div className="flex items-center gap-4"><button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700"><Menu className="h-6 w-6" /></button><h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{activeView === 'dashboard' && 'Student Dashboard'}{activeView === 'profile' && 'My Profile'}{activeView === 'attendance' && 'Attendance History'}{activeView === 'fees' && 'Fee Payment'}{activeView === 'exams' && 'My Academic Performance'}{activeView === 'notifications' && 'Alerts & Notifications'}</h1></div>
           <div className="flex items-center gap-4"><div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200"><div className="bg-indigo-100 p-2 rounded-full hidden sm:block"><User className="h-5 w-5 text-indigo-600" /></div><div><p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p><p className="text-xs text-gray-500 capitalize hidden sm:block">Student</p></div></div></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {activeView === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {/* Attendance Card */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-lg ${attColor.bg.replace('100', '50')}`}><CheckCircle2 className={`h-6 w-6 ${attColor.icon}`} /></div>
                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${attColor.bg} ${attColor.text}`}>{parseFloat(attendanceStats.percentage) >= 85 ? 'Good' : 'Needs Impr.'}</span>
                   </div>
                   <h3 className="text-gray-500 text-sm font-medium">Attendance</h3>
                   <p className="text-3xl font-bold text-gray-900">{attendanceStats.percentage}%</p>
                   <div className="flex justify-between mt-2 text-sm"><span className="text-gray-500">Present: {attendanceStats.presentCount}/{attendanceStats.totalDays}</span><span className={`font-medium ${attendanceStats.lastStatus === 'Present' ? 'text-green-600' : 'text-red-600'}`}>Last: {attendanceStats.lastStatus}</span></div>
               </div>

               {/* Academic Performance Summary Card */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                   {dashboardStats ? (
                     <>
                        <div className="flex justify-between items-start mb-4">
                           <div className="bg-blue-50 p-3 rounded-lg"><BarChart3 className="h-6 w-6 text-blue-600" /></div>
                           {dashboardStats.trend === 'up' && <span className="flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full"><TrendingUp className="h-3 w-3" /> Improving</span>}
                           {dashboardStats.trend === 'down' && <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full"><TrendingDown className="h-3 w-3" /> Dropping</span>}
                           {dashboardStats.trend === 'flat' && <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full"><Minus className="h-3 w-3" /> Stable</span>}
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Last Exam: {dashboardStats.latest.examId.name}</h3>
                        <p className="text-3xl font-bold text-gray-900">{dashboardStats.latest.percentage}%</p>
                        <div className="mt-3 text-sm space-y-1">
                          <div className="flex items-center gap-2 text-green-700"><Award className="h-3 w-3" /> Best: <span className="font-semibold">{dashboardStats.bestSub.subjectName} ({dashboardStats.bestSub.obtainedMarks})</span></div>
                          <div className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-3 w-3" /> Weak: <span className="font-semibold">{dashboardStats.weakSub.subjectName} ({dashboardStats.weakSub.obtainedMarks})</span></div>
                        </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">No exam data available yet</p>
                     </div>
                   )}
               </div>

               {/* Fee Card (Detailed Status) */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                   <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-lg ${isFeeDue ? 'bg-red-50' : 'bg-green-50'}`}>
                        <CreditCard className={`h-6 w-6 ${isFeeDue ? 'text-red-600' : 'text-green-600'}`} />
                     </div>
                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isFeeDue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isFeeDue ? 'Payment Due' : 'Paid'}
                     </span>
                   </div>
                   
                   <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Total Fee</p>
                        <p className="text-xl font-bold text-gray-900">₹{feeSummary?.totalFee || 0}</p>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div>
                           <p className="text-gray-500">Paid</p>
                           <p className="font-semibold text-green-600">₹{feeSummary?.paidFee || 0}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-gray-500">Pending</p>
                           <p className="font-semibold text-red-600">₹{feeSummary?.remainingFee || 0}</p>
                        </div>
                      </div>

                      {isFeeDue && (
                        <div className="bg-red-50 p-2 rounded text-xs text-red-700 font-medium text-center border border-red-100">
                           Next Due: {nextDueMonth}
                        </div>
                      )}

                      <button 
                        onClick={() => setActiveView('fees')}
                        className="w-full mt-2 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                      >
                        View Fees <ChevronRight className="h-4 w-4" />
                      </button>
                   </div>
               </div>
               
               <div className="md:col-span-3 bg-indigo-50 rounded-xl border border-indigo-100 p-8">
                  <h3 className="text-lg font-bold text-indigo-900 mb-2">Welcome back, {user.firstName}!</h3>
                  <p className="text-indigo-700">Check your upcoming exams and fee dues in the sidebar.</p>
               </div>
             </div>
           )}

           {activeView === 'notifications' && (
              <div className="max-w-3xl mx-auto space-y-4">
                 {notifications.length === 0 ? (
                   <div className="text-center p-12 bg-white rounded-xl border border-gray-100 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No new notifications.</p>
                   </div>
                 ) : (
                   notifications.map(notif => (
                      <div key={notif.id} className={`p-6 rounded-xl border shadow-sm flex items-start gap-4 ${notif.color} bg-white`}>
                         <div className={`p-3 rounded-full bg-opacity-20 bg-current`}>
                           <notif.icon className={`h-6 w-6`} />
                         </div>
                         <div className="flex-1">
                            <h3 className={`font-bold text-lg mb-1`}>{notif.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-3">{notif.date.toLocaleDateString()} at {notif.date.toLocaleTimeString()}</p>
                         </div>
                      </div>
                   ))
                 )}
              </div>
           )}
           
           {activeView === 'attendance' && (
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4"><div className={`p-4 rounded-full ${attColor.bg}`}><CheckCircle2 className={`h-8 w-8 ${attColor.icon}`} /></div><div><h2 className="text-3xl font-bold text-gray-900">{attendanceStats.percentage}%</h2><p className="text-sm text-gray-500 font-medium">Overall Attendance</p></div></div>
                  <div className="flex gap-8 text-center"><div><p className="text-xs text-gray-500 uppercase font-semibold">Present</p><p className="text-xl font-bold text-green-600">{attendanceStats.presentCount}</p></div><div><p className="text-xs text-gray-500 uppercase font-semibold">Absent</p><p className="text-xl font-bold text-red-600">{attendanceStats.totalDays - attendanceStats.presentCount}</p></div><div><p className="text-xs text-gray-500 uppercase font-semibold">Total</p><p className="text-xl font-bold text-gray-900">{attendanceStats.totalDays}</p></div></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex gap-2"><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border-gray-300 rounded-lg text-sm bg-gray-50 py-2 px-3">{monthNames.map((m, idx) => (<option key={idx} value={idx}>{m}</option>))}</select><select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border-gray-300 rounded-lg text-sm bg-gray-50 py-2 px-3">{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div className="flex gap-4 text-xs font-medium"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Present</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Absent</span></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {loadingAttendance ? <div className="p-12 text-center text-gray-500">Loading history...</div> : filteredHistory.length === 0 ? <div className="p-12 text-center text-gray-500 italic">No attendance records for {monthNames[selectedMonth]} {selectedYear}.</div> : (
                    <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Day</th><th className="px-6 py-4">Session</th><th className="px-6 py-4">Time</th><th className="px-6 py-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredHistory.map((record) => { const d = new Date(record.date); return (<tr key={record._id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-medium">{d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td><td className="px-6 py-4 text-gray-500 text-sm">{d.toLocaleDateString(undefined, { weekday: 'short' })}</td><td className="px-6 py-4 text-gray-600 text-sm">{record.session}</td><td className="px-6 py-4 text-gray-500 text-xs font-mono">{record.startTime} - {record.endTime}</td><td className="px-6 py-4 text-right"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{record.status === 'Present' ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{record.status}</span></td></tr>); })}</tbody></table></div>
                  )}
                </div>
             </div>
           )}

           {activeView === 'exams' && (
              <div className="space-y-6">
                {!selectedExamResult ? (
                  <>
                    {/* 1. Performance Overview */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="text-center p-2 border-r border-gray-100 last:border-0">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Average Score</p>
                          <p className="text-3xl font-bold text-indigo-600">{overallStats?.overallAvg || 0}%</p>
                       </div>
                       <div className="text-center p-2 border-r border-gray-100 last:border-0">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Exams Taken</p>
                          <p className="text-3xl font-bold text-gray-900">{overallStats?.totalExams || 0}</p>
                       </div>
                       <div className="text-center p-2 border-r border-gray-100 last:border-0">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Best Subject</p>
                          <p className="text-lg font-bold text-green-600 truncate">{overallStats?.bestSubject || '-'}</p>
                       </div>
                       <div className="text-center p-2">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Weakest Subject</p>
                          <p className="text-lg font-bold text-red-600 truncate">{overallStats?.weakestSubject || '-'}</p>
                       </div>
                    </div>

                    {/* 2. Exam List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                       <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Exam History</h2></div>
                       {loadingExams ? <div className="p-12 text-center text-gray-500">Loading exams...</div> : examResults.length === 0 ? <div className="p-12 text-center text-gray-500">No exams recorded.</div> : (
                         <div className="overflow-x-auto">
                           <table className="w-full text-left">
                             <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                               <tr>
                                 <th className="px-6 py-4">Exam Name</th>
                                 <th className="px-6 py-4">Date</th>
                                 <th className="px-6 py-4">Percentage</th>
                                 <th className="px-6 py-4 text-right">Action</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                               {examResults.map((result) => (
                                 <tr key={result._id} onClick={() => setSelectedExamResult(result)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                   <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileText className="h-5 w-5" /></div>
                                      {result.examId.name}
                                   </td>
                                   <td className="px-6 py-4 text-gray-600">{new Date(result.examId.scheduledDate).toLocaleDateString()}</td>
                                   <td className="px-6 py-4 font-bold text-gray-800">{result.percentage}%</td>
                                   <td className="px-6 py-4 text-right">
                                     <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1">View <ChevronRight className="h-4 w-4" /></button>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       )}
                    </div>
                  </>
                ) : (
                  /* 3. Exam Detail View */
                  <div className="space-y-6">
                    <button onClick={() => setSelectedExamResult(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors">
                      <ArrowLeft className="h-5 w-5" /> Back to Exam List
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                       <div className="p-6 border-b border-gray-100 bg-indigo-600 text-white">
                          <h2 className="text-2xl font-bold">{selectedExamResult.examId.name}</h2>
                          <div className="flex flex-wrap gap-4 mt-2 text-indigo-100 text-sm">
                             <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(selectedExamResult.examId.scheduledDate).toLocaleDateString()}</span>
                             <span className="flex items-center gap-1"><BookOpenCheck className="h-4 w-4" /> {selectedExamResult.examId.subjects?.length || 0} Subjects</span>
                          </div>
                       </div>
                       
                       {/* Subject Table */}
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                               <tr>
                                 <th className="px-6 py-4">Subject</th>
                                 <th className="px-6 py-4 text-center">Marks Obtained</th>
                                 <th className="px-6 py-4 text-center">Total Marks</th>
                                 <th className="px-6 py-4 text-right">Percentage</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                {selectedExamResult.subjectResults.map((sub, idx) => (
                                   <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 font-medium text-gray-900">{sub.subjectName}</td>
                                      <td className="px-6 py-4 text-center font-bold text-gray-800">{sub.obtainedMarks}</td>
                                      <td className="px-6 py-4 text-center text-gray-500">{sub.maxMarks}</td>
                                      <td className="px-6 py-4 text-right text-sm">
                                         {((sub.obtainedMarks / sub.maxMarks) * 100).toFixed(1)}%
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                             {/* 4. Exam Summary Footer */}
                             <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                                <tr>
                                   <td className="px-6 py-4">TOTAL</td>
                                   <td className="px-6 py-4 text-center text-indigo-700">{selectedExamResult.totalObtainedMarks}</td>
                                   <td className="px-6 py-4 text-center text-gray-600">{selectedExamResult.totalMaxMarks}</td>
                                   <td className="px-6 py-4 text-right text-lg text-indigo-700">{selectedExamResult.percentage}%</td>
                                </tr>
                             </tfoot>
                          </table>
                       </div>
                    </div>
                  </div>
                )}
              </div>
           )}

           {activeView === 'profile' && (
             <div className="max-w-4xl mx-auto">
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="bg-indigo-600 p-8 text-white relative">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                     <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg relative">
                       {user.profilePhoto ? (
                         <img src={`http://localhost:5000/${user.profilePhoto}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                       ) : (
                         <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                           <User className="h-10 w-10" />
                         </div>
                       )}
                       <button onClick={() => setShowProfileModal(true)} className="absolute bottom-0 right-0 bg-indigo-500 p-2 rounded-full text-white shadow-sm hover:bg-indigo-700 transition-colors">
                         <Camera className="h-4 w-4" />
                       </button>
                     </div>
                     <div className="text-center md:text-left">
                       <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                       <p className="text-indigo-200">Register No: {user.registerNumber}</p>
                     </div>
                     <div className="md:ml-auto">
                       <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                         <Edit className="h-4 w-4" /> Add / Edit Details
                       </button>
                     </div>
                   </div>
                 </div>
                 {/* ... Profile Details Grid (Unchanged) ... */}
                 <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                     <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Personal Information</h3>
                     <div className="space-y-4">
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">First Name</span><span className="font-medium text-gray-900">{user.firstName}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Last Name</span><span className="font-medium text-gray-900">{user.lastName}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Date of Birth</span><span className="font-medium text-gray-900">{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Father's Name</span><span className="font-medium text-gray-900">{user.fatherName || '-'}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Mother's Name</span><span className="font-medium text-gray-900">{user.motherName || '-'}</span></div>
                     </div>
                   </div>
                   <div>
                     <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Academic & Contact</h3>
                     <div className="space-y-4">
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Class</span><span className="font-medium text-gray-900">{user.className || '-'}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Medium</span><span className="font-medium text-gray-900">{user.medium || '-'}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Phone</span><span className="font-medium text-gray-900">{user.phoneNumber || '-'}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Whatsapp</span><span className="font-medium text-gray-900">{user.whatsappNumber || '-'}</span></div>
                       <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-600">Address</span><span className="font-medium text-gray-900 text-right">{user.address || '-'}</span></div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}
           
           {activeView === 'fees' && <StudentFeeManager user={user} />}
        </main>
      </div>

      {showProfileModal && (
        <ProfileEditModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
          onUpdate={handleProfileUpdate} 
        />
      )}
    </div>
  );
};
export default StudentDashboard