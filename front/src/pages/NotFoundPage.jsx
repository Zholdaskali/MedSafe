import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-lg mb-6">The page you are looking for does not exist.</p>
                <Link
                    to="/"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;