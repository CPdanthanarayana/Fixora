import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 shadow">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          Fixora 🚀
        </Link>

        {/* Links */}
        <ul className="flex space-x-6 font-medium">
          <li><Link to="/jobs" className="hover:text-gray-200">Jobs</Link></li>
          <li><Link to="/issues" className="hover:text-gray-200">Issues</Link></li>
          <li><Link to="/profile" className="hover:text-gray-200">Profile</Link></li>
          <li><Link to="/login" className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-lg shadow hover:bg-yellow-300 transition">
            Login
          </Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
