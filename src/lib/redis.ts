import {createClient} from "redis";
import config from "../config/config";

const redis =createClient({
    url : config.redisUrl
});

redis.connect().then(()=>{
    console.log("Connected to Redis successfully");
}).catch((err)=>{
    console.error("Redis connection error:",err);
    process.exit(1);
});

export default redis;