import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users,  LogOut, User, BarChart3, School, UserPlus, X, Menu } from 'lucide-react';
import api from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Added for mobile toggle
  
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  useEffect(() => {
    if (activeView === 'approvals') {
      fetchPendingStudents();
    }
  }, [activeView]);

  const fetchPendingStudents = async () => {
    setLoadingPending(true);
    try {
      const response = await api.get('/students/pending');
      if(Array.isArray(response.data)) {
        setPendingStudents(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch pending students", err);
    } finally {
      setLoadingPending(false);
    }
  };

  const approveStudent = async (studentId) => {
    try {
      const response = await api.put(`/students/approve/${studentId}`, {});
      
      if (response.status === 200) {
        setPendingStudents(prev => prev.filter(s => s._id !== studentId));
        alert("Student Approved Successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving student");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (!user) return null;

  const renderDashboardView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold text-gray-900">1,240</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Welcome to your Dashboard</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
            Select an option from the sidebar to manage students, fees, attendance, and more.
        </p>
      </div>
    </>
  );

  const renderApprovalsView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Pending Student Approvals</h2>
        <button onClick={fetchPendingStudents} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button>
      </div>
      
      {loadingPending ? (
        <div className="p-12 text-center text-gray-500">Loading...</div>
      ) : pendingStudents.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No pending approvals found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Register No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Registered On</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{student.registerNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => approveStudent(student._id)}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200">
           <div className="flex items-center gap-2 text-indigo-600">
              <School className="h-8 w-8" />
              <span className="text-xl font-bold">EduManager</span>
           </div>
           {/* Close button for mobile */}
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
             <X className="h-6 w-6" />
           </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <LayoutDashboard className="h-5 w-5" /> Dashboard
          </button>
          
          <button onClick={() => { setActiveView('approvals'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'approvals' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <UserPlus className="h-5 w-5" /> Pending Approvals
          </button>

          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
             <Users className="h-5 w-5" /> Students
          </a>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
           <div className="flex items-center gap-4">
              {/* Mobile Hamburger Toggle */}
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
                <Menu className="h-6 w-6" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {activeView === 'dashboard' ? 'Overview' : 'Approvals'}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                 <div className="bg-indigo-100 p-2 rounded-full hidden sm:block">
                    <User className="h-5 w-5 text-indigo-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize hidden sm:block">{localStorage.getItem('role')} Account</p>
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {activeView === 'dashboard' && renderDashboardView()}
           {activeView === 'approvals' && renderApprovalsView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard