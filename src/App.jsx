
import { Route,Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Chat from './pages/Chat/Chat'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {auth} from './config/firebase'
import { AppContext } from './context/AppContext';
import './index.css'
const App = () => {

  const navigate=useNavigate();//for navigation purpose
  const {loadUserData} = useContext(AppContext)

  useEffect(()=>{
    //whenever login logout happens this will  called
    onAuthStateChanged(auth, async (user) => {
      //if user is available then and if not then navigate to login/signup page
          if(user){
                navigate('/chat')
                await loadUserData(user.uid)
          }else{
            navigate('/')
          }
    })
  },[])
  return (
    <>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/profile' element={<ProfileUpdate/>}/>

      </Routes>
    </>
  )
}

export default App
