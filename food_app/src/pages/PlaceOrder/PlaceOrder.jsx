/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext.jsx'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const navigate =useNavigate();
  const {getTotalCartAmount,token,food_list,cartItems,url}= useContext(StoreContext);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [data,setData]=useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipCode:"",
    country:"",
    phone:""
  })
  const onChangeHandler =(event)=>{
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const openRazorpayCheckout = async (orderData) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please refresh and try again.");
      return;
    }

    const response = await axios.post(url + "/api/order/razorpay/create", orderData, { headers: { token } });

    if (!response.data.success) {
      alert(response.data.message || "Unable to start Razorpay checkout");
      return;
    }

    const { key, amount, currency, razorpayOrderId, appOrderId } = response.data;

    const options = {
      key,
      amount,
      currency,
      name: "Tandoori Bites",
      description: "Food Order Payment",
      order_id: razorpayOrderId,
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
      },
      handler: async function (razorpayResponse) {
        try {
          const verifyResponse = await axios.post(
            url + "/api/order/razorpay/verify",
            {
              ...razorpayResponse,
              orderId: appOrderId,
            },
            { headers: { token } }
          );

          if (verifyResponse.data.success) {
            navigate("/myorders");
          } else {
            alert(verifyResponse.data.message || "Payment verification failed");
            navigate("/cart");
          }
        } catch (error) {
          console.log(error);
          alert("Payment verification failed");
          navigate("/cart");
        }
      },
      theme: {
        color: "#ff6347",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
      itemInfo["quantity"] = cartItems[item._id];
      orderItems.push(itemInfo);
    }
    })
    let orderData={
      address:data,
      items:orderItems,
      amount:getTotalCartAmount()+40,
    }

    if (paymentMethod === "razorpay") {
      await openRazorpayCheckout(orderData);
      return;
    }

    let response =await axios.post(url+"/api/order/place",orderData,{headers:{token}})
    if(response.data.success){
      const {session_url}=response.data;
      window.location.replace(session_url);
    }
    else{
      navigate("/")
    }
  };
  useEffect(()=>{
    if(!token){
      navigate("/cart")
    }
    else if(getTotalCartAmount()===0){
      navigate('/cart')
    }


  },[token])
  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className='title'> Delivery Info</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input required  name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email Address' />
        <input required  name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required  name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required  name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div> 
        <div className="multi-fields">
          <input required name='zipCode' onChange={onChangeHandler} value={data.zipCode} type="text" placeholder='Zip Code' />
          <input required  name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required  name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
      <div className="cart-total">
        <h2>Cart Total</h2>
        <div className="payment-methods">
          <p className="payment-title">Payment Method</p>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === "stripe"}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            Card / Stripe
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            UPI / Razorpay
          </label>
        </div>
        <div>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Delivery detail</p>
            <p>₹{getTotalCartAmount()===0?0:40}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Total</p>
            <p>₹{getTotalCartAmount()===0?0:getTotalCartAmount()+ 40}</p>
          </div>
          </div>          
        <button type='submit' >{paymentMethod === "razorpay" ? "Pay with UPI" : "Proceed to Pay"}</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
