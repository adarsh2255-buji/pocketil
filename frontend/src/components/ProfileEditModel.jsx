import React, { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
import api from '../utils/api'; 

const ProfileEditModal = ({ user, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    className: user.className || 'V',
    medium: user.medium || 'English',
    syllabus: user.syllabus || 'State',
    schoolName: user.schoolName || '',
    fatherName: user.fatherName || '',
    motherName: user.motherName || '',
    phoneNumber: user.phoneNumber || '',
    whatsappNumber: user.whatsappNumber || '',
    address: user.address || '',
    password: '',
    profilePhoto: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePhoto: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const response = await api.put('/students/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onUpdate(response.data.student);
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Update Profile Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Academic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Academic Info</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select name="className" value={formData.className} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  {['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Medium</label>
                <select name="medium" value={formData.medium} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  <option value="English">English</option>
                  <option value="Malayalam">Malayalam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Syllabus</label>
                <select name="syllabus" value={formData.syllabus} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  <option value="State">State</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Info</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Whatsapp Number</label>
                <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                <div className="mt-1 flex items-center">
                  <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                    <span className="flex items-center gap-2"><Upload className="h-4 w-4"/> Choose File</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <span className="ml-3 text-sm text-gray-500">{formData.profilePhoto ? formData.profilePhoto.name : 'No file selected'}</span>
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Leave blank to keep current password" />
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;