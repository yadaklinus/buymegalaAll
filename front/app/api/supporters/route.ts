import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
const prisma  = new PrismaClient()

export async function POST(req:NextRequest){
    const {email} = await req.json()
    try {
        const user = await prisma.user.findUnique({where:{email}})

        const supporters = await prisma.supporters.findMany({where:{userId:user?.id}})

        return NextResponse.json(supporters,{status:200})
    } catch (error) {
        return NextResponse.json(error,{status:500})
    }finally{
        prisma.$disconnect()
    }
}