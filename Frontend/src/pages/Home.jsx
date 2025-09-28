import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function Home() {
  return (
    <div className="h-full w-full flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 md:px-16">
      {/* Left Side - Content */}
      <div className="flex-1 max-w-xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Welcome to <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
            Fixora 🚀
          </span>
        </h1>

        <p className="text-gray-200 text-xl md:text-2xl mb-8 leading-relaxed">
          Find skilled professionals, <br />
          solve issues instantly, and connect <br />
          in real-time.
        </p>

        <div className="flex gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 bg-yellow-400 text-blue-900 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-yellow-300 transition transform hover:scale-105"
          >
            Sign Up <ArrowRight size={20} />
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition transform hover:scale-105"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Right Side - Animation */}
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <div className="relative w-full max-w-lg">
          {/* Animated circles in the background */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          {/* Main illustration/icon */}
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="h-64 flex items-center justify-center text-8xl">
                🛠️
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
