
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
const stripe =new Stripe(process.env.STRIPE_CREATE_KEY);
//place order
const placeOrder =async (req,res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
 try{
  const newOrder = new orderModel ({
    userId:req.body.userId,
    items:req.body.items,
    amount:req.body.amount,
    address:req.body.address
  }) 
  await newOrder.save();
  await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}})
  const line_items = req.body.items.map((item) => {
    return {
      price_data:{
        currency:"inr",
        product_data:{
          name:item.name,
          images:[item.image]
        },
        unit_amount:item.price*100
      },
      quantity:item.quantity
    
    }
  })
  line_items.push({
    price_data:{
      currency:"inr",
      product_data:{
        name:"Delivery Charges"
      },
      unit_amount:4*100
    },
    quantity:1
  })
   const session =await stripe.checkout.sessions.create({
    line_items:line_items,
    mode:'payment',
    success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
    cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
  })
  res.json({success:true,session_url:session.url})
}catch(error){
  console.log(error)
  res.json({success:false,message:"internal server error"})
}
}
const verifyOrder= async (req,res)=>{
  const {orderId,success} =req.body;
  try {
    if(success === true || success === "true"){
      await orderModel.findByIdAndUpdate(orderId,{payment:true,status:"Out for Delivery"});
      res.json({success:true,message:"paid"})
    }else{
      await orderModel.findByIdAndDelete(orderId);
      res.json({success:true,message:"cancelled"})
    }
  }catch(error){
    console.log(error);
    res.json({success:false,message:"internal server error"})
  }
}
const userOrders =async(req,res)=>{
  try {
    const orders= await orderModel.find({userId:req.body.userId})
    res.json({success:true,data:orders})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"internal server error"})
  }
}

const listOrders= async(req,res)=>{
  try {
    const orders =await orderModel.find({});
    res.json({success:true,data:orders})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"internal server error"})
  }
}
const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.json({ success: false, message: "orderId and status are required" });
  }

  try {
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "order status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "internal server error" });
  }
}

export{placeOrder,verifyOrder,userOrders,listOrders,updateOrderStatus}
