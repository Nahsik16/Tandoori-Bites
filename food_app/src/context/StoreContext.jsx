/* eslint-disable react/prop-types */
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);
const StoreContextProvider = (props) => {
  const [cartItems, setcartItems] = useState({});
  const url = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4000" : "https://tandoori-bites.onrender.com");
  const [token,setToken]=useState("");
  const [food_list,setFoodList]=useState([])


  const addTocart = async (itemId) => {
    if (!cartItems[itemId]) {
      setcartItems((prev) => ({ ...prev, [itemId]: 1 }))
    } else {
      setcartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
    }
    if(token){
      await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
    }
  }
  const removeFromCart = async (itemId) => {
      setcartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    if(token){
      await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
    }
  }
  const getTotalCartAmount = () =>{
    let totalAmount = 0;
    for(const item in cartItems){
      if (cartItems[item]>0){
        
      let itemInfo = food_list.find((product)=>product._id === item);
      totalAmount += itemInfo.price* cartItems[item];
      }  
     }
     return totalAmount;
  }
  const fetchFoodList =async() =>{
    const response = await axios.get(url+"/api/food/list");
    setFoodList(response.data.data);
  }
  const loadCartData =async (token)=>{
    try {
      const response = await axios.post(url+"/api/cart/get",{}, {
        headers:{
          token
        }
      });
      if (response.data?.success && response.data?.data && typeof response.data.data === "object") {
        setcartItems(response.data.data);
      } else {
        setcartItems({});
      }
    } catch (error) {
      setcartItems({});
    }
  }
  useEffect(()=>{
    async function loadData(){
      await fetchFoodList();
      if(localStorage.getItem("token")){
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
  },[])
  const contextValue = {
    food_list,
    cartItems,
    setcartItems,
    addTocart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
