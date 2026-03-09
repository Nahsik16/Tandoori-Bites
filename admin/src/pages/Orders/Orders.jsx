/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../Orders/Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
    const response = await axios.post(`${url}/api/order/list`, {});
    if (response.data.success) {
      setOrders(response.data.data);
      console.log(response.data.data);
    } else {
      toast.error('Error fetching orders');
    }
  } catch (error) {
    toast.error('Network error');
  }
    // try {
    //   const response = await axios.get(`${url}/api/order/list`, {});
    //   if (response.data.success) {
    //     setOrders(response.data.data);
    //     console.log(response.data.data);
    //   } else {
    //     toast.error('Error fetching orders');
    //   }
    // } catch (error) {
    //   toast.error('Network error');
    // }
  };

  const statusHandler = async (event, orderId) => {
    const nextStatus = event.target.value;

    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: nextStatus,
      });

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: nextStatus } : order
          )
        );
        toast.success('Order status updated');
      } else {
        toast.error(response.data.message || 'Unable to update status');
      }
    } catch (error) {
      toast.error('Network error while updating status');
    }
  };
  

  useEffect(() => {
    fetchAllOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="Parcel icon" />
            <div>
              <p className='order-item-food'>
                {order.items.map((item, idx) => (
                  `${item.name}X${item.quantity}${idx < order.items.length - 1 ? ',' : ''}`
                ))}
              </p>
              <p className="order-item-name">{`${order.address.firstName} ${order.address.lastName}`}</p>
              <div className="order-item-address">
                <p>{`${order.address.street},`}</p>
                <p>{`${order.address.city},${order.address.state},${order.address.zipCode},${order.address.country}`}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>₹{order.amount}.00</p>
            <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
              <option value="Processing">Processing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <p><span>&#x25fc;</span><b>{order.status}</b></p>
            <p>{order.payment ? 'Paid' : 'Pending Payment'}</p>
            <p>{new Date(order.date).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
