import React from 'react'
import { School } from 'lucide-react'


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <School className="h-6 w-6 text-indigo-400" />
            <span className="text-xl font-bold">EduManager</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering tuition centers and schools with next-generation management tools. Simplify administration, amplify learning.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-indigo-400">Platform</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-white transition">Attendance</a></li>
            <li><a href="#" className="hover:text-white transition">Fee Management</a></li>
            <li><a href="#" className="hover:text-white transition">Exam Grading</a></li>
            <li><a href="#" className="hover:text-white transition">Student App</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-indigo-400">Company</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-white transition">About Us</a></li>
            <li><a href="#" className="hover:text-white transition">Careers</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-indigo-400">Contact</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <span>support@edumanager.com</span>
            </li>
            <li>+91 98765 43210</li>
            <li>Kerala, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} EduManager. All rights reserved.
      </div>
    </div>
  </footer>
  )
}

export default Footer