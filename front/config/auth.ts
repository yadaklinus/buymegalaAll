import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@/app/generated/prisma";
import axios from "axios";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();


export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async signIn({ user }: { user: any }) {
            try {
                if (!user.email) return false; // Ensure email exists

                await axios.post("http://localhost:4000/auth/register",{user}).then((res)=>{
                    if(res.status === 200){
                        return true
                    }else{
                        false
                    }
                })
                return true


            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            } 
            
        },
         async jwt({token,user}){
            if (user) {
                token.id = user.id;
              }
              token.authToken = jwt.sign(
                { email: token.email },
                process.env.NEXTAUTH_SECRET as string,
                { expiresIn: "1h" } 
              );
            
              return token;
        },
        async session({session,token}){
            if (session?.user) {
               
                session.authToken = token.authToken; 
              }
              return session;
        },
       
    },
    
        session:{
            strategy:"jwt",
        },
};