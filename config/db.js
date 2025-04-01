import mongoose from "mongoose";

let cached = global.mongoose || {conn: null, promise: null};

export default async function connectDB () {
    const db_name = 'deepseek';
    
    if(cached.conn) return cached.conn;
    if(!cached.promise){
        cached.promise = mongoose.connect(process.env.MONGODB_URI + '/' + db_name).then((mongoose)=> mongoose);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }

    return cached.conn;
}