import { PrismaClient } from "@/app/generated/prisma"
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();
export async function POST(req:NextRequest){
    const { userName } = await req.json()
    try {
        const user = await prisma.user.findUnique({where:{userName}})

        if(!user){
            return NextResponse.json("Not Found",{status:404})
        }

        // if(user.goLive === false){
        //      return NextResponse.json("Not Found",{status:404})
        // }

        return NextResponse.json({
            userName:user?.userName,
            galaPrice:user?.galaPrice,
            goLive:user?.goLive,
            profilePicture:user.profilePicture,
            displayName:user.fullName,
        },{status:200})
    } catch (error) {
        return NextResponse.json(error,{status:500})
    }finally{
        prisma.$disconnect();
    }
}