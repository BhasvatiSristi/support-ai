const mongo_url = process.env.MONGODB_URL

import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("DNS SERVERS:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.cluster0.9vag8j2.mongodb.net",
  (err, records) => {
    console.log("SRV TEST ERROR:", err);
    console.log("SRV TEST RECORDS:", records);
  }
);

import { connect } from "mongoose"

if(!mongo_url){
    console.log('Mongo URL not found')
}

let cache = global.mongoose
if(!cache){
    cache = global.mongoose={conn:null,promise:null}
}

const connectDb = async () =>{
    console.log("Attempting MongoDB connection...");
    console.log("URL exists:", !!mongo_url);
    if(cache.conn){
        console.log("Using cached connection");
        return cache.conn
    }
    if(!cache.promise){
        cache.promise = connect(mongo_url!).then((c)=>c.connection)
    }

    try {
        cache.conn = await cache.promise;
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        throw err;
    }
    console.log("MongoDB connected successfully");
    return cache.conn
}


export default connectDb