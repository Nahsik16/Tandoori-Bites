
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
const stripe =new Stripe(process.env.STRIPE_CREATE_KEY);
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

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

const createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.json({ success: false, message: "Razorpay keys are not configured" });
    }

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const razorpayOrder = await razorpay.orders.create({
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: `order_${newOrder._id}`,
      notes: {
        appOrderId: String(newOrder._id),
        userId: String(req.body.userId),
      },
    });

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      appOrderId: newOrder._id,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "internal server error" });
  }
};

const verifyRazorpayOrder = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.json({ success: false, message: "Missing payment verification fields" });
  }

  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.json({ success: false, message: "Razorpay keys are not configured" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid Razorpay signature" });
    }

    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId, userId: req.body.userId },
      { payment: true, status: "Out for Delivery" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "payment verified" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "internal server error" });
  }
};

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

export{placeOrder,verifyOrder,userOrders,listOrders,updateOrderStatus,createRazorpayOrder,verifyRazorpayOrder}
