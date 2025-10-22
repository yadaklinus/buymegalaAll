import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient()

export async function POST(req:NextRequest){
    const {email,newPrice} = await req.json()
    try {
        const user = await prisma.user.findUnique({where:{email}})
        if (!user) return NextResponse.json("error",{status:500})

        await prisma.user.update({
            where:{
                email
            },
            data:{
                galaPrice:parseInt(newPrice)
            }
        })
        return NextResponse.json("Done",{status:200})
        
    } catch (error) {
        return NextResponse.json(error,{status:500})
    }finally{
        prisma.$disconnect()
    }
}