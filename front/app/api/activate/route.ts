import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient()

export async function POST(req:NextRequest){
    const {email,active} = await req.json()
    try {
        const user = await prisma.user.findUnique({where:{email}})
        if (!user) return NextResponse.json("error",{status:500})

        const ch  = await prisma.user.update({
            where:{
                email
            },
            data:{
                goLive: Boolean(active)
            }
        })
        return NextResponse.json(ch,{status:200})
        
    } catch (error) {
        return NextResponse.json(error,{status:500})
    }finally{
        prisma.$disconnect()
    }
}

