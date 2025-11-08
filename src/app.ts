import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/auth.route";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin : "http://localhost:3000",
    credentials : true,
}));

// const redisStore = new RedisStore({
//     client: redis,
//     prefix : "sess:"
// });

// app.use(session({
//     store : redisStore,
//     secret : config.sessionSecret,
//     resave : false,
//     saveUninitialized : false,
//     cookie : {
//         secure : false,
//         httpOnly : true,
//         sameSite : "lax",
//         maxAge: 1000 * 60 * 60 * 24,
//     }
// }));

app.use("/api/auth",authRoutes )

app.get("/" , (req , res)=>{
    res.send("Hello World");
});

export default app;