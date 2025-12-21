const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('attendance'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !userData || role !== 'teacher') {
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

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-200">
           <div className="flex items-center gap-2 text-indigo-600">
              <School className="h-8 w-8" />
              <span className="text-xl font-bold">EduTeacher</span>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
             <X className="h-6 w-6" />
           </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          <button onClick={() => { setActiveView('attendance'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeView === 'attendance' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
             <CheckCircle2 className="h-5 w-5" /> Attendance
          </button>
          {/* Add more teacher features here later (Marks, etc.) */}
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
                {activeView === 'attendance' ? 'Mark Attendance' : 'Dashboard'}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                 <div className="bg-indigo-100 p-2 rounded-full hidden sm:block">
                    <User className="h-5 w-5 text-indigo-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize hidden sm:block">Teacher</p>
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {activeView === 'attendance' && <AttendanceManager />}
        </main>
      </div>
    </div>
  );
};
export default TeacherDashboard;