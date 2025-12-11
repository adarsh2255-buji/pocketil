import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronDown, Loader2, School } from 'lucide-react';
import api from '../utils/api';

const StudentRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [institutions, setInstitutions] = useState([]);

    const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    institutionId: ''
  });

  // Fetch Institutions on Mount
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/students/institutions');
        setInstitutions(response.data);
      } catch (err) {
        console.error("Failed to fetch institutions", err);
        setError("Failed to load institutions");
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.institutionId) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/students', formData);
      const data = response.data;

      // Success - Redirect to Login with specific waiting message
      navigate('/login', { 
        state: { 
          message: `Registration complete! Your Register Number is: ${data.data.registerNumber} and Temporary Password is: ${data.data.temporaryPassword}. Please save these credentials as you will need them to log in after Admin approval.`,
          type: 'warning'
        } 
      });

    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Registration failed');
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
          Student Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join your institution today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
               <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 border px-3"
                    placeholder="Jane"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 border px-3"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Select Institution</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <School className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="institutionId"
                  value={formData.institutionId}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border appearance-none bg-white"
                >
                  <option value="">Select your tuition center</option>
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 px-2 flex items-center text-gray-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register Student'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Log in
                </Link>
             </p>
          </div>
        </div>
      </div>
    </div>  )
}

export default StudentRegister