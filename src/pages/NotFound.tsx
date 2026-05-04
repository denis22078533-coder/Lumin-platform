import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Ð£Ð¿Ñ! Ð¡ÑÑÐ°Ð½Ð¸ÑÐ° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð°</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          ÐÐµÑÐ½ÑÑÑÑÑ Ð½Ð° Ð³Ð»Ð°Ð²Ð½ÑÑ
        </a>
      </div>
    </div>
  );
};

export default NotFound;
