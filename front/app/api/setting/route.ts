import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "API endpoint moved to Express backend." }, { status: 410 });
}