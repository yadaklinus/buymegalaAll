// NextAuth has been replaced with custom cookie-based authentication.
// Custom auth endpoints are located at /auth/register, /auth/login, /auth/logout, and /auth/me in the backend server.
export async function GET() {
  return new Response("NextAuth has been replaced with custom backend cookie authentication.", { status: 410 });
}

export async function POST() {
  return new Response("NextAuth has been replaced with custom backend cookie authentication.", { status: 410 });
}