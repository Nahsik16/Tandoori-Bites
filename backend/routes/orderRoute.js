import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { placeOrder, verifyOrder,userOrders,listOrders,updateOrderStatus } from '../controllers/oderController.js'
const orderRouter = express.Router();
orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.post("/list",listOrders);
orderRouter.post("/status",updateOrderStatus);

export default orderRouter;