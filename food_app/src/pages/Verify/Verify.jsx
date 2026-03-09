/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
const Verify = () => {
  const [searchParams,setSearchParams]=useSearchParams();
  const success =searchParams.get("success")
  const orderId =searchParams.get("orderId")
  const {url,token,setToken}=useContext(StoreContext);
  const navigate =useNavigate();
  const verifyPayment = async() =>{
    try {
      console.log("Verifying payment with:", { success, orderId });
      const response = await axios.post(url + "/api/order/verify", { success, orderId });
      console.log("Response from server:", response.data);
      if (response.data.success) {
        navigate("/myorders");   
      } else {
        navigate("/cart");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
     if(token){
      localStorage.removeItem("token");
      setToken("");
       navigate ("/");
         }
     else{
       navigate("/");
     }
    }
  };
  useEffect(()=>{
    verifyPayment();
  },[]);
  return (
    <div className='verify'>
      <div className="spinner"></div>
  
    </div>
  )
}

export default Verify