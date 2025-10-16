import { Link } from "react-router-dom";
import { ArrowRight, Rocket } from "lucide-react";

function Home() {
  return (
    <div className="w-full h-full bg-[#F7F9FB] relative font-sans flex flex-col">
      {/* Background shapes */}
      <div className="absolute top-0 -left-16 w-72 h-72 bg-[#2EC4B6]/80 rounded-3xl transform -rotate-45"></div>
      <div className="absolute -top-24 -right-12 w-96 h-96 bg-[#2EC4B6]/80 rounded-3xl transform -rotate-45"></div>
      <div className="absolute -bottom-12 -right-4 w-60 h-60 bg-[#2EC4B6]/80 rounded-3xl transform -rotate-45">
        <span className="absolute top-10 right-10 text-3xl"></span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 md:pl-4 md:pr-8">
        {/* Hero Section */}
        <main className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 md:gap-8 min-h-[60vh] md:h-[60vh]">
          {/* Left Side - Content */}
          <div className="flex flex-col items-start text-left px-2 md:px-0 md:-ml-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Your Repairs,
              <br />
              Simplified
            </h1>
            <p className="text-gray-500 text-base sm:text-lg md:text-xl mb-6 md:mb-10 max-w-sm md:max-w-md">
              Find skilled professionals, solve issues instantly, and connect in
              real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 sm:px-6 py-3 sm:py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
              >
                Sign Up <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/login"
                className="border border-[#2EC4B6] text-[#2EC4B6] font-semibold px-4 sm:px-6 py-3 sm:py-3 rounded-full hover:bg-[#2EC4B6] hover:text-white transition-all text-sm sm:text-base w-full sm:w-auto text-center"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Side - Glassmorphism Card */}
          <div className="hidden md:flex items-center justify-center h-full">
            <div className="relative w-[450px] h-[300px] bg-white/10 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20">
              {/* Inner blurred circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2EC4B6] rounded-full opacity-60 filter blur-3xl"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
