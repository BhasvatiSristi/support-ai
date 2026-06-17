const mongo_url = process.env.MONGODB_URL
import { connect } from "mongoose"

if(!mongo_url){
    console.log('Mongo URL not found')
}

let cache = global.mongoose
if(!cache){
    cache = global.mongoose={conn:null,promise:null}
}

const connectDb = async () =>{
    if(cache.conn){
        return cache.conn
    }
    if(!cache.promise){
        cache.promise = connect(mongo_url!).then((c)=>c.connection)
    }

    try{
        cache.conn = await cache.promise
    }catch (err){
        console.log(err)
    }
    return cache.conn
}


export default connectDb