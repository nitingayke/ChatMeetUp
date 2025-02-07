import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="absolute p-3 inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-r from-black to-gray-800 overflow-auto">
            <div className="h-fit p-8 border border-gray-700 rounded-lg shadow-lg text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white">404</h1>
                <h2 className="text-3xl md:text-4xl text-gray-300">Not Found</h2>
                <p className="text-gray-400 mt-2">
                    The page you are looking for does not exist.
                </p>
                <Link
                    to="/"
                    className="mt-4 inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-all"
                >
                    Redirect to Dashboard
                </Link>
            </div>
        </div>

    )
}