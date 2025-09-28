function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-4 px-4 md:px-6">
      <p className="text-sm md:text-base">
        © {new Date().getFullYear()} Fixora. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
