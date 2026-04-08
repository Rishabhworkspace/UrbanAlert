import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl md:text-8xl font-extrabold text-brand-navy opacity-20">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mt-4">
        Page Not Found
      </h2>
      <p className="text-slate-500 mt-2 max-w-md">
        The page you are looking for doesn't exist, has been moved, or you don't have permission to view it.
      </p>
      <Link 
        to="/" 
        className="mt-6 px-6 py-3 bg-brand-navy hover:bg-blue-900 text-white rounded-lg transition-colors font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
