import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users,  LogOut, User, School, UserPlus, X, 
  Menu, GraduationCap, Loader2, CheckCircle2, BookOpen, FileText } from 'lucide-react';
import api from '../utils/api';
import AttendanceManager from '../components/AttendanceManager';
import ExamManager from './ExamManager';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !userData) { navigate('/login'); } else { setUser(JSON.parse(userData)); }
  }, [navigate]);

  useEffect(() => {
    if (activeView === 'approvals') {
      const fetchPending = async () => {
        setLoadingPending(true);
        try {
          const response = await api.get('/students/pending');
          setPendingStudents(response.data);
        } catch (err) { console.error(err); } finally { setLoadingPending(false); }
      };
      fetchPending();
    }
  }, [activeView]);

  const approveStudent = async (studentId) => {
    try {
      const response = await api.put(`/students/approve/${studentId}`, {});
      if (response.status === 200) {
        setPendingStudents(prev => prev.filter(s => s._id !== studentId));
        alert("Student Approved Successfully!");
      }
    } catch (err) { alert("Error approving student"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (!user) return null;

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
          <button onClick={() => { setActiveView('exams'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'exams' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><FileText className="h-5 w-5" /> Exams & Marks</button>
        </div>
        <div className="p-4 border-t border-gray-200"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors"><LogOut className="h-5 w-5" /> Sign Out</button></div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
           <div className="flex items-center gap-4"><button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700"><Menu className="h-6 w-6" /></button><h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{activeView === 'dashboard' && 'Overview'}{activeView === 'approvals' && 'Approvals'}{activeView === 'teachers' && 'Manage Teachers'}{activeView === 'batches' && 'Manage Batches'}{activeView === 'students' && 'Students Directory'}{activeView === 'attendance' && 'Mark Attendance'}{activeView === 'exams' && 'Exams & Grading'}</h1></div>
           <div className="flex items-center gap-4"><div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200"><div className="bg-indigo-100 p-2 rounded-full hidden sm:block"><User className="h-5 w-5 text-indigo-600" /></div><div><p className="text-sm font-bold text-gray-900">{user.name}</p><p className="text-xs text-gray-500 capitalize hidden sm:block">Admin</p></div></div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {activeView === 'dashboard' && <div className="p-12 text-center text-gray-500">Dashboard Overview (Placeholder)</div>}
           {activeView === 'approvals' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Pending Student Approvals</h2></div>
                {loadingPending ? <div className="p-12 text-center">Loading...</div> : (
                  <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-600 text-xs uppercase"><tr><th className="px-6 py-4">Register No</th><th className="px-6 py-4">Name</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{pendingStudents.map(s => (<tr key={s._id}><td className="px-6 py-4">{s.registerNumber}</td><td className="px-6 py-4">{s.firstName} {s.lastName}</td><td className="px-6 py-4 text-right"><button onClick={() => approveStudent(s._id)} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">Approve</button></td></tr>))}</tbody></table></div>
                )}
             </div>
           )}
           {activeView === 'attendance' && <AttendanceManager />}
           {activeView === 'exams' && <ExamManager />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard