import { GoHome, GoArrowLeft, GoQuestion } from "react-icons/go"
import { Link, useNavigate } from "react-router-dom"

export default function NotFound() {

    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Icon */}
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GoQuestion size={48} className="text-gray-400" />
                </div>

                {/* Error Message */}
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved. Let's get you back to where you need to be.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors font-medium"
                    >
                        <GoHome size={18} />
                        Go Home
                    </Link>

                    <button
                        onClick={() => navigate(-1)}
                        className="cursor-pointer flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <GoArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                {/* Additional Help */}
                <div className="mt-12 p-4 bg-white rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-500 mb-3">
                        If you think this is an error, try refreshing the page or check the URL for typos.
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                        <span>Error Code: 404</span>
                        <span>•</span>
                        <span>Page Not Found</span>
                    </div>
                </div>
            </div>
        </div >
    )
}
