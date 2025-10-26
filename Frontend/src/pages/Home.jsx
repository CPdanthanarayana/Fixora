import { Link } from "react-router-dom";
import { ArrowRight, Rocket } from "lucide-react";
import LandingImage from "../assets/LandingImage.png";

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
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        {/* Hero Section */}
        <main className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 w-full">
          {/* Left Side - Content */}
          <div className="flex flex-col items-start text-left space-y-6 md:space-y-8 max-w-xl">
            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Repairs,
              <br />
              Simplified
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl md:text-xl leading-relaxed">
              Find skilled professionals, solve issues instantly, and connect in
              real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg transition-transform transform hover:scale-105 text-base"
              >
                Sign Up <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="border-2 border-[#2EC4B6] text-[#2EC4B6] font-semibold px-8 py-3.5 rounded-full hover:bg-[#2EC4B6] hover:text-white transition-all text-base text-center"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Side - Landing Illustration */}
          <div className="hidden md:flex items-center justify-center h-full relative">
            {/* Decorative background elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Large soft teal circle background */}
              <div className="absolute w-[450px] h-[450px] bg-[#A8E6E3]/30 rounded-full blur-2xl"></div>

              {/* Left side - Small teal circle near wrench */}
              <div className="absolute left-12 top-1/3 w-3 h-3 bg-[#2EC4B6] rounded-full"></div>
              <div className="absolute left-6 top-1/2 w-32 h-32 bg-teal-50/60 rounded-full"></div>

              {/* Top left - Simple cloud */}
              <div className="absolute top-16 left-8 w-16 h-10 bg-white/70 rounded-full"></div>
              <div className="absolute top-14 left-4 w-12 h-8 bg-white/70 rounded-full"></div>

              {/* Top right - Yellow dots */}
              <div className="absolute top-12 right-16 w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-24 right-20 w-2 h-2 bg-yellow-300 rounded-full"></div>

              {/* Right side - Light bulb area circle */}
              <div className="absolute right-8 top-1/4 w-28 h-28 bg-orange-50/50 rounded-full"></div>

              {/* Right side large teal circle */}
              <div className="absolute right-4 top-1/3 w-20 h-20 bg-[#2EC4B6]/15 rounded-full"></div>

              {/* Bottom left - Simple cloud */}
              <div className="absolute bottom-20 left-2 w-18 h-11 bg-white/60 rounded-full"></div>
              <div className="absolute bottom-18 left-0 w-14 h-9 bg-white/60 rounded-full"></div>

              {/* Bottom right - Wavy lines */}
              <div className="absolute bottom-12 right-4 w-20 h-20 opacity-25">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-gray-300"
                >
                  <path
                    d="M10,40 Q30,30 50,40 T90,40"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                  <path
                    d="M10,55 Q30,45 50,55 T90,55"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                  <path
                    d="M10,70 Q30,60 50,70 T90,70"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* Main illustration - positioned above decorations */}
            <img
              src={LandingImage}
              alt="Skilled professionals illustration"
              className="relative z-10 w-[520px] max-w-full h-auto object-contain drop-shadow-xl select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
