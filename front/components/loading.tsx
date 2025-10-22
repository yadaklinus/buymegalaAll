
export default function Loading({ message = "Loading..." }: { message?: string }) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-yellow-500 animate-spin"></div>
            </div>
    )
  }