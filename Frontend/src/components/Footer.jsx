function Footer() {
  return (
    <footer className=" text-teal-500 font-bold text-center py-4 px-4 md:px-6">
      <p className="text-sm md:text-base">
        © {new Date().getFullYear()} Fixora. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
