import React from 'react'
import { Link } from 'react-router-dom'
import { School, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Header = () => {
      const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
     <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <School className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              EduManager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
            <a href="#solutions" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Solutions</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
            
            <div className="flex items-center gap-4 ml-4">
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Log In
              </Link>
              <Link 
                to="/register-institution" 
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a href="#features" className="block px-3 py-2 text-gray-600 font-medium">Features</a>
            <a href="#solutions" className="block px-3 py-2 text-gray-600 font-medium">Solutions</a>
            <Link to="/login" className="block px-3 py-2 text-indigo-600 font-bold">Log In</Link>
            <Link to="/register-institution" className="block w-full text-center mt-4 bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold">
              Register Institution
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header