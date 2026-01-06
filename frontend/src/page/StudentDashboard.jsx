import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, User, CheckCircle2, CreditCard, FileText, School, LogOut, X, Menu, Camera, Edit, } from 'lucide-react';
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
    }
  }, [user]);

  const fetchFullProfile = async () => {
    try {
      const response = await api.get('/students/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      console.error("Failed to fetch full profile", err);
    }
  };

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const response = await api.get('/attendance/my-history');
      setAttendanceStats(response.data.stats);
      setAttendanceHistory(response.data.history);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setLoadingAttendance(false);
    }
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

  // Helper for attendance color
  const getAttColor = (pct) => {
    const val = parseFloat(pct);
    if (val >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600' };
    if (val >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-600' };
    return { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' };
  };

  if (!user) return null;
  
  const attColor = getAttColor(attendanceStats.percentage);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar for Student */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200">
           <div className="flex items-center gap-2 text-indigo-600">
              <School className="h-8 w-8" />
              <span className="text-xl font-bold">EduStudent</span>
           </div>
           {/* Close button for mobile */}
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
             <X className="h-6 w-6" />
           </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => { setActiveView('profile'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <User size={20} /> My Profile
          </button>
          <button onClick={() => { setActiveView('attendance'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'attendance' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <CheckCircle2 size={20} /> Attendance
          </button>
          <button onClick={() => { setActiveView('fees'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'fees' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <CreditCard size={20} /> Fees
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
           <div className="flex items-center gap-4">
              {/* Mobile Hamburger Toggle */}
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
                <Menu className="h-6 w-6" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {activeView === 'dashboard' && 'Student Dashboard'}
                {activeView === 'profile' && 'My Profile'}
                {activeView === 'attendance' && 'Attendance History'}
                {activeView === 'fees' && 'Fee Payment'}
              </h1>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                 <div className="bg-indigo-100 p-2 rounded-full hidden sm:block">
                    <User className="h-5 w-5 text-indigo-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 capitalize hidden sm:block">Student</p>
                 </div>
              </div>
           </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {activeView === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {/* Attendance Summary Card */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-lg ${attColor.bg.replace('100', '50')}`}>
                        <CheckCircle2 className={`h-6 w-6 ${attColor.icon}`} />
                     </div>
                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${attColor.bg} ${attColor.text}`}>
                        {parseFloat(attendanceStats.percentage) >= 85 ? 'Good' : parseFloat(attendanceStats.percentage) >= 70 ? 'Average' : 'Low'}
                     </span>
                   </div>
                   <h3 className="text-gray-500 text-sm font-medium">Attendance</h3>
                   <p className="text-3xl font-bold text-gray-900">{attendanceStats.percentage}%</p>
                   <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-500">Present: {attendanceStats.presentCount}/{attendanceStats.totalDays}</span>
                      <span className={`font-medium ${attendanceStats.lastStatus === 'Present' ? 'text-green-600' : attendanceStats.lastStatus === 'Absent' ? 'text-red-600' : 'text-gray-400'}`}>
                        Last: {attendanceStats.lastStatus}
                      </span>
                   </div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-start mb-4">
                     <div className="bg-purple-50 p-3 rounded-lg"><CreditCard className="h-6 w-6 text-purple-600" /></div>
                     <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Status</span>
                   </div>
                   <h3 className="text-gray-500 text-sm font-medium">Fee Status</h3>
                   <p className="text-3xl font-bold text-gray-900">Active</p>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-start mb-4">
                     <div className="bg-blue-50 p-3 rounded-lg"><User className="h-6 w-6 text-blue-600" /></div>
                   </div>
                   <h3 className="text-gray-500 text-sm font-medium">Profile Status</h3>
                   <p className="text-lg font-bold text-gray-900">Approved</p>
                   <p className="text-sm text-gray-400 mt-2">Reg No: {user.registerNumber}</p>
               </div>
               
               <div className="md:col-span-3 bg-indigo-50 rounded-xl border border-indigo-100 p-8">
                  <h3 className="text-lg font-bold text-indigo-900 mb-2">Welcome back, {user.firstName}!</h3>
                  <p className="text-indigo-700">Check your upcoming exams and fee dues in the sidebar.</p>
               </div>
             </div>
           )}
           
           {activeView === 'attendance' && (
             <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-gray-900">Attendance History</h2>
                 <div className={`px-3 py-1 rounded-full text-sm font-bold ${attColor.bg} ${attColor.text}`}>
                   Overall: {attendanceStats.percentage}%
                 </div>
               </div>
               {loadingAttendance ? (
                 <div className="p-12 text-center text-gray-500">Loading history...</div>
               ) : attendanceHistory.length === 0 ? (
                 <div className="p-12 text-center text-gray-500">No attendance records found.</div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                       <tr>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4">Session</th>
                         <th className="px-6 py-4">Time</th>
                         <th className="px-6 py-4 text-right">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {attendanceHistory.map((record) => (
                         <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 text-gray-900 font-medium">
                             {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                           </td>
                           <td className="px-6 py-4 text-gray-600">{record.session}</td>
                           <td className="px-6 py-4 text-gray-500 text-sm">{record.startTime} - {record.endTime}</td>
                           <td className="px-6 py-4 text-right">
                             <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                               record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                             }`}>
                               {record.status === 'Present' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                               {record.status}
                             </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
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