import { PrismaClient } from "@/app/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient()

export async function POST(req:NextRequest){
    const {name,message,amount,userName} = await req.json()
    try {
        const user = await prisma.user.findUnique({where:{
            userName
        }})
        if(!user) return NextResponse.json("not found",{status:404})

        const trans = await prisma.supporters.create({
            data:{
                name,
                message,
                amount,
                userId:user.id,
                currency:"NGN"
            }
        })

        return NextResponse.json(trans,{status:201})
    } catch (error) {
        return NextResponse.json(error,{status:500})
    }finally{
        prisma.$disconnect()
    }
}