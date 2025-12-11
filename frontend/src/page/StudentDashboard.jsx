import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, User, CheckCircle2, CreditCard, FileText, School, LogOut, X, Menu, Camera, Edit, } from 'lucide-react';
import ProfileEditModal from '../components/ProfileEditModel';
import api from '../utils/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'profile'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !userData || role !== 'student') {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist update
  };

  // Helper function to get profile photo URL using axios baseURL
  const getProfilePhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return null;
    return `${api.defaults.baseURL.replace('/api', '')}/${profilePhoto}`;
  };

  if (!user) return null;

  // --- Views ---

  const renderDashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Attendance Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Good</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Attendance</h3>
          <p className="text-3xl font-bold text-gray-900">85%</p>
          <p className="text-sm text-gray-400 mt-2">Total Present: 45 days</p>
      </div>

      {/* Fee Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">Due</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Fee Pending</h3>
          <p className="text-3xl font-bold text-gray-900">₹2,000</p>
          <p className="text-sm text-gray-400 mt-2">Next due: 15th Dec</p>
      </div>

      {/* Profile Status Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Profile Status</h3>
          <p className="text-lg font-bold text-gray-900">Approved</p>
          <p className="text-sm text-gray-400 mt-2">Reg No: {user.registerNumber}</p>
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-indigo-600 p-8 text-white relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg relative">
              {user.profilePhoto ? (
                <img src={getProfilePhotoUrl(user.profilePhoto)} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <User className="h-10 w-10" />
                </div>
              )}
              <button 
                onClick={() => setShowProfileModal(true)}
                className="absolute bottom-0 right-0 bg-indigo-500 p-2 rounded-full text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-indigo-200">Register No: {user.registerNumber}</p>
            </div>
            <div className="md:ml-auto">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                <Edit className="h-4 w-4" /> Add / Edit Details
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">First Name</span>
                <span className="font-medium text-gray-900">{user.firstName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Last Name</span>
                <span className="font-medium text-gray-900">{user.lastName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Date of Birth</span>
                <span className="font-medium text-gray-900">{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Father's Name</span>
                <span className="font-medium text-gray-900">{user.fatherName || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Mother's Name</span>
                <span className="font-medium text-gray-900">{user.motherName || '-'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Academic & Contact</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Class</span>
                <span className="font-medium text-gray-900">{user.className || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Medium</span>
                <span className="font-medium text-gray-900">{user.medium || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-900">{user.phoneNumber || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Whatsapp</span>
                <span className="font-medium text-gray-900">{user.whatsappNumber || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-600">Address</span>
                <span className="font-medium text-gray-900 text-right">{user.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <LayoutDashboard className="h-5 w-5" /> Dashboard
          </button>
          <button onClick={() => { setActiveView('profile'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <User className="h-5 w-5" /> My Profile
          </button>
          {/* Placeholders for future features */}
          <button onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
             <CheckCircle2 className="h-5 w-5" /> Attendance
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
             <CreditCard className="h-5 w-5" /> Fees
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
             <FileText className="h-5 w-5" /> Exam Results
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
            <LogOut className="h-5 w-5" /> Sign Out
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
                {activeView === 'dashboard' ? 'Student Dashboard' : 'My Profile'}
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
           {activeView === 'dashboard' ? renderDashboardStats() : renderProfileView()}
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