import { AlertTriangle } from "lucide-react";
import Link from "next/link";



export default function NotFoundPage() {
   
    return (
        <div className="text-center py-16 px-4 bg-white rounded-lg shadow-xl">
            <AlertTriangle className="mx-auto h-24 w-24 text-yellow-500" />
            <h1 className="mt-8 text-6xl font-extrabold text-gray-800">404</h1>
            <h2 className="mt-2 text-3xl font-bold text-gray-700">Page Not Found</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
                Oops! The page you're looking for seems to have gotten lost.
            </p>
            <div className="mt-8">
                <Link
                    href={"/"}
                    className="bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-600 transition duration-300"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}