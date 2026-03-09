import "./config/env.js"
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
//app config
const app = express()
const port =process.env.PORT|| 4000
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://tandoori-bites-frontend.onrender.com",
  "https://tandoori-bites-admin.onrender.com",
];
const envOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
//middleware
app.use (express.json())
app.use(cors({
  origin: (origin, callback) => {
    const isRenderDomain = typeof origin === "string" && origin.endsWith(".onrender.com");
    if (!origin || allowedOrigins.includes(origin) || isRenderDomain) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}))
//db connection
connectDB();
//api routes
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)

app.get("/",(req,res)=>{
  res.send("hello world")
})

app.listen(port,()=>{
  console.log(`server started on http://localhost:${port}`)
  console.log(`reCAPTCHA configured: ${Boolean(process.env.RECAPTCHA_SECRET_KEY?.trim())}`)
})
