import { Webhook } from "svix";
import connectDB from "@/config/db.js";
import User from "@/models/User.js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
    const wh = new Webhook(process.env.SIGNING_SECRET);
    const headerPayload = await headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-signature": headerPayload.get("svix-signature"),
    };

    // Get the Payload and verify it

    const payLoad = await req.json();
    const body = JSON.stringify(payLoad);
    const {data, type} = wh.verify(body,svixHeaders);
    

    // Prepare the UserData to save in the database 
    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
    };

    await connectDB();

    switch (type) {
        case 'user.created':
            await User.create(userData);
            break;
        
        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData);
            break;

        case 'user.deleted':
            await User.findByIdAndDelete(data.id);
            break;
    
        default:
            break;
    }

    return NextResponse.json({message: "Event received"});
}