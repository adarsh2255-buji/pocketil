import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ChevronDown, Loader2, CheckCircle2, School, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';



const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  
  const successMsg = location.state?.message;
  const msgType = location.state?.type;

  const [formData, setFormData] = useState({
    role: 'owner', 
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setWarning('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWarning('');

    try {
      const roleEndpoint = `${formData.role}s`;
      
      const response = await api.post(`/${roleEndpoint}/login`, {
        email: formData.email,
        password: formData.password,
        ...(formData.role === 'student' ? { registerNumber: formData.email } : {})
      });

      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data[formData.role])); 
      localStorage.setItem('role', formData.role);

      // --- FIXED NAVIGATION LOGIC ---
      if (formData.role === 'owner') {
        navigate('/owner-dashboard');
      } else if (formData.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (formData.role === 'teacher') {
        navigate('/teacher-dashboard'); 
      } else {
        navigate('/student-dashboard'); 
      }

    } catch (err) {
      if (err.response && err.response.status === 403 && err.response.data.msg.includes('approval')) {
         setWarning('Your account is waiting for Admin approval. Please contact your institution.');
      } else {
         setError(err.response?.data?.msg || err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <School className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {successMsg && (
             <div className={`mb-4 p-3 ${msgType === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-100' : 'bg-green-50 text-green-700 border-green-100'} text-sm rounded-lg border flex items-start gap-2`}>
                {msgType === 'warning' ? <Clock className="h-5 w-5 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 mt-0.5" />} 
                <span>{successMsg}</span>
             </div>
          )}

          {warning && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex items-center gap-2">
               <AlertTriangle className="h-5 w-5" /> {warning}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
               <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 px-2 flex items-center text-gray-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.role === 'student' ? 'Register Number' : 'Email Address'}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.role === 'student' ? (
                     <User className="h-5 w-5 text-gray-400" />
                  ) : (
                     <Mail className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type={formData.role === 'student' ? 'text' : 'email'}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                  placeholder={formData.role === 'student' ? 'ABC001' : 'you@example.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
             <p className="text-sm text-gray-600">
                Are you a Student?{' '}
                <Link to="/register-student" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Register here
                </Link>
             </p>
             <p className="text-sm text-gray-600">
                Owner Registration?{' '}
                <Link to="/register-institution" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Click here
                </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login