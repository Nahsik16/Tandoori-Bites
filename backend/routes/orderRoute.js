import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { placeOrder, verifyOrder,userOrders,listOrders,updateOrderStatus,createRazorpayOrder,verifyRazorpayOrder } from '../controllers/oderController.js'
const orderRouter = express.Router();
orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/razorpay/create",authMiddleware,createRazorpayOrder);
orderRouter.post("/razorpay/verify",authMiddleware,verifyRazorpayOrder);
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.post("/list",listOrders);
orderRouter.post("/status",updateOrderStatus);
orderRouter.post("/update-status",updateOrderStatus);

export default orderRouter;