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
      let response;
      try {
        response = await axios.post(`${url}/api/order/status`, {
          orderId,
          status: nextStatus,
        });
      } catch (error) {
        if (error?.response?.status === 404) {
          response = await axios.post(`${url}/api/order/update-status`, {
            orderId,
            status: nextStatus,
          });
        } else {
          throw error;
        }
      }

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
      const errorMessage = error?.response?.data?.message || error?.message || 'Network error while updating status';
      toast.error(errorMessage);
    }
  };
  

  useEffect(() => {
    fetchAllOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageSrc = (order) => {
    const firstItemImage = order?.items?.[0]?.image;
    return firstItemImage ? `${url}/images/${firstItemImage}` : assets.parcel_icon;
  };

  return (
    <div className='order add'>
      <h3>Orders</h3>
      <div className="order-list">
        {orders.map((order) => {
          const statusClass = order.status?.toLowerCase().replace(/\s+/g, '-') || 'processing';
          return (
          <div key={order._id} className="order-item">
            <img className='order-thumb' src={getImageSrc(order)} alt="Order item" />
            <div className='order-details'>
              <p className='order-item-food'>
                {order.items.map((item, idx) => (
                  `${item.name} x ${item.quantity}${idx < order.items.length - 1 ? ', ' : ''}`
                ))}
              </p>
              <p className="order-item-name">{`${order.address.firstName} ${order.address.lastName}`}</p>
              <div className="order-item-address">
                <p>{`${order.address.street}, ${order.address.city}`}</p>
                <p>{`${order.address.state}, ${order.address.zipCode}, ${order.address.country}`}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
            </div>
            <div className='order-summary'>
              <p className='order-price'>₹{order.amount}.00</p>
              <p>Items: {order.items.length}</p>
              <p>{order.payment ? 'Paid' : 'Pending Payment'}</p>
              <p className='order-date'>{new Date(order.date).toLocaleString()}</p>
            </div>
            <div className='order-actions'>
              <p className={`order-status ${statusClass}`}><span>&#x25fc;</span><b>{order.status}</b></p>
              <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
                <option value="Processing">Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Orders;
