import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "../assets/Logo.png";
function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 shadow-lg bg-white">
      <nav className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <img src={Logo} alt="Fixora Logo" className="h-10 sm:h-12 w-auto" />
        </Link>

        {/* Links */}
        <ul className="flex space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 font-semibold items-center font-body">
          <li>
            <Link
              to="/jobs"
              className="text-base sm:text-lg md:text-xl text-teal-500 hover:text-teal-600 py-2 px-2 sm:px-3 transition-colors duration-200"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              to="/issues"
              className="text-base sm:text-lg md:text-xl text-teal-500 hover:text-teal-600 py-2 px-2 sm:px-3 transition-colors duration-200"
            >
              Problems
            </Link>
          </li>
          {user && (
            <li>
              <Link
                to="/profile"
                className="text-base sm:text-lg md:text-xl text-teal-500 hover:text-teal-600 py-2 px-2 sm:px-3 transition-colors duration-200"
              >
                Profile
              </Link>
            </li>
          )}

          {!user && (
            <li>
              <Link
                to="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 font-heading"
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
