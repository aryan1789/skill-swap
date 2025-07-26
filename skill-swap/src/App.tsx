import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SkillSwap from './pages/SkillSwap'
import ProjectLink from './pages/ProjectLink'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import SignUp from './pages/Signup'
import React, { useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ViewProfile from './pages/ViewProfile'
import ProtectedRoute from './components/ProtectedRoute'
import SwapRequests from './pages/SwapRequests'
import { useAppSelector } from './store/hooks';

const App: React.FC = () => {
  const mode = useAppSelector((state) => state.theme.mode);
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(mode === "dark" ? "theme-dark" : "theme-light");
  }, [mode]);
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path='/skillswap' element={<ProtectedRoute><SkillSwap /></ProtectedRoute>} />
          <Route path='/projectLink' element={<ProtectedRoute><ProjectLink /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<SignUp />} />
          <Route path='/profile' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path='/viewprofile' element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
          <Route path="/swap-requests" element={<ProtectedRoute><SwapRequests /></ProtectedRoute>} />
        </Routes>
      </Router>
    </div>
  )
}


export default App
