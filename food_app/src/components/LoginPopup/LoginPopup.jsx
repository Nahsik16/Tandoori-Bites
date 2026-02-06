/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import PropTypes from 'prop-types' // Add this line
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"
const LoginPopup = ({setShowLogin}) => {

  const {url,setToken} =useContext(StoreContext)
  const[currState,setCurrState] =useState("Login")
  const [resetMessage, setResetMessage] = useState("")
  const [data,setData] = useState({
    name:"",
    email:"",
    password:""
  })
  const onChangeHandler =(event)=>{
    const name =event.target.name;
    const value =event.target.value;
    setData(data=>({...data,[name]:value}))
  }
  const onLogin =async (event)=>{
    event.preventDefault();

    if(currState==="Reset"){
      try {
        const response = await axios.post(url+"/api/user/reset-request",{ email: data.email });
        if(response.data.success){
          setResetMessage("Reset link sent. Check your email.");
        }
        else{
          setResetMessage(response.data.message || "Failed to send reset link");
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Reset request failed";
        setResetMessage(message);
      }
      return;
    }

    let newUrl =url;
    if(currState==="Login"){
      newUrl += "/api/user/login";
  }
  else{
    newUrl += "/api/user/register";
  }
  const response = await axios.post(newUrl,data);
  if(response.data.success){
   setToken(response.data.token);
    localStorage.setItem("token",response.data.token);
    setShowLogin(false)
  }
  else{
    alert(response.data.message)
  }
}
  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>
<div className="login-popup-inputs">
  {currState==="Sign Up"?<input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your Name' required/>:<></>}
  <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required/>
  {currState==="Reset"?<></>:<input name='password' onChange={onChangeHandler} value={data.password}  type="password" placeholder='password' required/>}
</div>

<button type='submit'>
  {currState==="Sign Up"?"Create Account":currState==="Reset"?"Send reset link":"Login"}
</button>
  {currState==="Reset" && resetMessage? <p className='login-popup-message'>{resetMessage}</p> : <></>}
  {currState==="Sign Up"?
    <div className="login-popup-condition">
      <input type="checkbox" required />
      <p>I agree to the terms and conditions</p>
    </div>
  :<></>}
  {currState==="Login"
  ?<>
    <p>Forgot your password? <span onClick={()=> {setCurrState("Reset"); setResetMessage("")}}>Reset here</span></p>
    <p>Create a new account?<span onClick={()=> setCurrState("Sign Up")}>Click here</span></p>
  </>
    :currState==="Reset"
    ?<p>Back to login?<span onClick={()=> setCurrState("Login")}>Login here</span></p>
    :<p>Already have an account ?<span onClick={()=> setCurrState("Login")}>Login here</span></p>
    }
  </form>
    </div>
  )
}

LoginPopup.propTypes = { // Add this block
  setShowLogin: PropTypes.func.isRequired
}

export default LoginPopup