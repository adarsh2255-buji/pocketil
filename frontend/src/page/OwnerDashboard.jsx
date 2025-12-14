import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, AlertTriangle, UserCog, LayoutDashboard, User, LogOut, Menu, X, School, Loader2, Users } from "lucide-react";
import api from "../utils/api";


const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'create-admin'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin Management State
  const [admins, setAdmins] = useState([]);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !userData || role !== 'owner') {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  // Fetch Admins on load (so they appear in dashboard)
  useEffect(() => {
    if (user) {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admins');
      setAdmins(response.data);
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/admins', adminForm);
      if (response.status === 201) {
        setMessage({ type: 'success', text: 'Admin created successfully!' });
        setAdminForm({ name: '', email: '', password: '' }); // Reset form
        fetchAdmins(); // Refresh list to show new admin in dashboard
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to create admin' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const renderDashboardView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                  <UserCog className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Institution Owner</h3>
            <p className="text-xl font-bold text-gray-900">Welcome, {user.name}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Admins</h3>
            <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
            <button 
              onClick={() => setActiveView('create-admin')}
              className="mt-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800"
            >
              Add New Admin →
            </button>
        </div>
      </div>

      {/* Admin List Table Moved Here */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Existing Admins</h2>
          <button onClick={fetchAdmins} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh List</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No admins found. Add one from the 'Manage Admins' tab.</td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">
                        {admin.name.charAt(0)}
                      </div>
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderCreateAdminView = () => (
    <div className="space-y-8">
      {/* Create Admin Form */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create New Admin</h2>
          <p className="text-sm text-gray-500">Admins have full access to manage students, fees, and exams.</p>
        </div>
        
        <div className="p-6">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={adminForm.name}
                onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={adminForm.email}
                onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                placeholder="admin@institution.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={adminForm.password}
                onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200">
           <div className="flex items-center gap-2 text-indigo-600">
              <School className="h-8 w-8" />
              <span className="text-xl font-bold">EduOwner</span>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
             <X className="h-6 w-6" />
           </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Management</p>
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <LayoutDashboard className="h-5 w-5" /> Dashboard
          </button>
          
          <button onClick={() => { setActiveView('create-admin'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'create-admin' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <UserCog className="h-5 w-5" /> Manage Admins
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {activeView === 'dashboard' ? 'Owner Dashboard' : 'Manage Admins'}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                 <div className="bg-indigo-100 p-2 rounded-full hidden sm:block">
                    <User className="h-5 w-5 text-indigo-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize hidden sm:block">Owner</p>
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {activeView === 'dashboard' ? renderDashboardView() : renderCreateAdminView()}
        </main>
      </div>
    </div>
  );
};
export default OwnerDashboard;