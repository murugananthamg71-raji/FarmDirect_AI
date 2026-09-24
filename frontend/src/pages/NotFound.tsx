import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Forbidden: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 rounded-full bg-red-100 text-red-600">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-darktext">403 — Access Forbidden</h1>
      <p className="text-gray-600 max-w-md">
        You do not have permission to view this page. This role is restricted by security policy.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-xs hover:bg-primary-dark transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 rounded-full bg-amber-100 text-amber-600">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-darktext">404 — Page Not Found</h1>
      <p className="text-gray-600 max-w-md">
        The requested page does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-xs hover:bg-primary-dark transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

