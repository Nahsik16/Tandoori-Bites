/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
const MyOrders = () => {
  const {url,token } =useContext(StoreContext);
  const [data,setData]=useState([]);
  
  const fetchOrders =async ()=>{
    try {
      const response = await axios.post(url+"/api/order/userorders",{}, {headers:{token}})
      if (response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    if(token){
      fetchOrders();
    }
  },[token])

  const getImageSrc = (order) => {
    const firstItemImage = order?.items?.[0]?.image;
    return firstItemImage ? `${url}/images/${firstItemImage}` : assets.parcel_icon;
  };

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {data.length === 0 ? (
          <div className="my-orders-empty">
            <img src={assets.parcel_icon} alt="No orders" />
            <p>No orders found yet.</p>
          </div>
        ) : (
          data.map((order) => {
            const statusClass = order.status?.toLowerCase().replace(/\s+/g, '-') || 'processing';
            return(
              <div key={order._id} className="my-orders-order">
                <img className='order-thumb' src={getImageSrc(order)} alt="Order item" />
                <div className="order-details">
                  <p className="order-items">
                    {order.items.map((item, index) => `${item.name} x ${item.quantity}${index < order.items.length - 1 ? ', ' : ''}`)}
                  </p>
                  <p className="order-meta">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="order-summary">
                  <p className="order-price">₹{order.amount}.00</p>
                  <p>Items: {order.items.length}</p>
                  <p>{order.payment ? 'Paid' : 'Pending Payment'}</p>
                </div>
                <div className="order-actions">
                  <p className={`order-status ${statusClass}`}><span>&#x25fc;</span><b>{order.status}</b></p>
                  <button onClick={fetchOrders}>Refresh Status</button>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}

export default MyOrders