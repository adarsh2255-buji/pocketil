import React from 'react'
import { 
  GraduationCap, 
  CheckCircle2, 
  BarChart3, 
  CreditCard, 
  Smartphone, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  School,
  LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';

import FeatureCard from '../components/FeatureCard';

const LandingPage = () => {
  return (
   <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute top-0 right-0 -mr-20 -mt-20">
          <div className="w-96 h-96 rounded-full bg-indigo-50 blur-3xl opacity-50"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-8 border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              The #1 Choice for Tuition Centers
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              Manage Your Institution <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Like a Pro
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamline attendance, automate fees, managing exams, and empower students with a dedicated app. All in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register-institution" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-1"
              >
                Register Your Institution
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a 
                href="#demo" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-indigo-600"
              >
                View Live Demo
              </a>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-gray-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Free 14-day trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Everything you need to run your school</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Stop using spreadsheets. Upgrade to a system that grows with your institution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={CheckCircle2}
              title="Smart Attendance"
              description="Mark attendance in seconds for batches. Generate instant reports for parents and admins. Track absenteeism effortlessly."
              color="bg-emerald-500"
            />
            <FeatureCard 
              icon={CreditCard}
              title="Fee Management"
              description="Automate fee collection. Track pending payments, generate professional receipts, and send automated reminders to parents."
              color="bg-blue-500"
            />
            <FeatureCard 
              icon={BarChart3}
              title="Exam & Grading"
              description="Create exams, enter marks subject-wise, and generate comprehensive report cards with performance analytics."
              color="bg-purple-500"
            />
            <FeatureCard 
              icon={Smartphone}
              title="Student App"
              description="A dedicated portal for students to view their attendance, pay fees online, and check exam results instantly."
              color="bg-pink-500"
            />
            <FeatureCard 
              icon={Users}
              title="Batch Management"
              description="Organize students into batches or classes. Assign teachers and create timetables specific to each group."
              color="bg-orange-500"
            />
            <FeatureCard 
              icon={LayoutDashboard}
              title="Admin Dashboard"
              description="Get a bird's eye view of your institution. Real-time stats on collections, admissions, and daily activities."
              color="bg-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us / Audience */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Built specifically for Tuition Owners</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center border border-indigo-700">
                      <ShieldCheck className="h-6 w-6 text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Data Security</h4>
                      <p className="text-indigo-200">Your student data is encrypted and secure. We prioritize privacy and reliability above all else.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center border border-indigo-700">
                      <GraduationCap className="h-6 w-6 text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Academic Focus</h4>
                      <p className="text-indigo-200">Designed to reduce administrative burden so you can focus on what matters: Teaching.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <button className="bg-white text-indigo-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg">
                    Start Your Journey
                  </button>
                </div>
              </div>
              <div className="relative h-64 lg:h-auto bg-indigo-800">
                {/* Abstract visualization of a dashboard */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <School className="w-64 h-64 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to transform your institution?</h2>
          <p className="text-xl text-gray-600 mb-10">Join 500+ tuition centers managing their operations effortlessly.</p>
          <Link 
            to="/register-institution"
            className="inline-block bg-indigo-600 text-white text-xl font-bold px-10 py-5 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
          >
            Register Now - It's Free
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage