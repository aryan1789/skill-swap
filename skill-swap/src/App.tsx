import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import SkillSwap from './pages/SkillSwap'
import ProjectLink from './pages/ProjectLink'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import SignUp from './pages/Signup'
import React from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ViewProfile from './pages/ViewProfile'
import ProtectedRoute from './components/ProtectedRoute'
import SwapRequests from './pages/SwapRequests'
const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<ProtectedRoute><Home/></ProtectedRoute>}/>
        <Route path='/skillswap' element={<ProtectedRoute><SkillSwap/></ProtectedRoute>}/>
        <Route path='/projectLink' element={<ProtectedRoute><ProjectLink/></ProtectedRoute>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<SignUp/>}/>
        <Route path='/profile' element={<ProtectedRoute><UserProfile/></ProtectedRoute>}/>
        <Route path='/viewprofile' element={<ProtectedRoute><ViewProfile/></ProtectedRoute>}/>
        <Route path="/swap-requests" element={<ProtectedRoute><SwapRequests/></ProtectedRoute>}/>
      </Routes>
    </Router>
  )
}
  

export default App
