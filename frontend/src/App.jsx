import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './page/LandingPage';
import Login from './page/Login';
import RegisterInstitution from './page/RegisterInstitution';
import AdminDashboard from './page/AdminDashboard';
import StudentRegister from './page/StudentRegister';
import StudentDashboard from './page/StudentDashboard';
import OwnerDashboard from './page/OwnerDashboard';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register-institution" element={<RegisterInstitution />} />
          <Route path="register-student" element={<StudentRegister />} />

        </Route>
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
