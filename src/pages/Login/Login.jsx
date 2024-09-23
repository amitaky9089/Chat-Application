import { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup , login , resetPass } from '../../config/firebase'

const Login = () => {

    const [currState,setCurrState]=useState("Sign Up"); // state variable for signup/login text
    //creating three state variable for our input 
    const [userName,setUserName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");

    const onSubmitHandler = (event) =>{
      event.preventDefault();//it helps to not reload the page when we submit the page.
      if(currState === "Sign Up"){
        signup(userName,email,password)//function which we imported from the firebase config folder
      }
      else{
        login(email,password)
      }
    }
    
  return (
    <div className='login'>
       <img src={assets.logo_big} alt="" className="logo" />
       <form onSubmit={onSubmitHandler} className="login-form">
           <h2>{currState}</h2>
           {currState==="Sign Up"?<input type="text" onChange={(e)=>setUserName(e.target.value)} value={userName} placeholder='username' className="form-input" required/>:null}
           <input type="email" onChange={(e)=>setEmail(e.target.value)} value={email} placeholder='Email address' className="form-input" required />
           <input type="password" onChange={(e)=>setPassword(e.target.value)} value={password} placeholder='password' className="form-input" required />
           <button type='submit'>{currState==="Sign Up"?"Create Account":"Login now"}</button>
           <div className='login-term'>
                <input type="checkbox" />
                <p>Agree to the terms of use & privacy policy.</p>
           </div>
           <div className='login-forgot'>
            {
                currState==="Sign Up"?<p className='login-toggle'>Already have an account <span onClick={()=>setCurrState("Login")}>Login here</span></p>:
                <p className='login-toggle'>Create an account <span onClick={()=>setCurrState("Sign Up")}>Click here</span></p>
            }
            {currState === "Login" ?  <p className='login-toggle'>Forgot Password ? <span onClick={()=>resetPass(email)}>Reset here</span></p>:null }  
           </div>
       </form>
    </div>
  )
}

export default Login
