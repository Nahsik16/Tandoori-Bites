// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react'
import Navbar from './components/navbar/navbar'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/footer/footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import ResetPassword from './pages/ResetPassword/ResetPassword'
const App = () => {
  const[showLogin,setShowLogin]= useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])
  return (
  <>
  {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
    <Navbar setShowLogin={setShowLogin}/>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/cart' element={<Cart/>}/>
      <Route path='/order' element={<PlaceOrder/>}/>
      <Route path='/verify' element={<Verify/>}/>
      <Route path='/myorders' element={<MyOrders/>}/>
      <Route path='/reset-password' element={<ResetPassword/>}/>
    </Routes>
    </div>
    <Footer/></>
  )
}

export default App
