import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Fixora 🚀
        </Link>

        {/* Links */}
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li><Link to="/jobs" className="hover:text-blue-600">Jobs</Link></li>
          <li><Link to="/issues" className="hover:text-blue-600">Issues</Link></li>
          <li><Link to="/profile" className="hover:text-blue-600">Profile</Link></li>
          <li><Link to="/login" className="text-blue-600">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
