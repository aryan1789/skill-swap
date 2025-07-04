import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import SkillSwap from './pages/SkillSwap'
import ProjectLink from './pages/ProjectLink'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import SignUp from './pages/Signup'
import './App.css'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/skillswap' element={<SkillSwap/>}/>
        <Route path='/projectLink' element={<ProjectLink/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/profile' element={<UserProfile/>}/>
      </Routes>
    </Router>
  )
}
  

export default App
