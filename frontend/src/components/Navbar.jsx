import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] slidedown px-15 py-8">
      <div className="w-full flex items-center justify-between bg-lime-100/90 text-black px-5 py-3 rounded-md backdrop-blur-md border-black border">

        <Link
          to="/"
          className="text-3xl font-semibold tracking-tight "
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          ClientsMine
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium ">
          <Link to="/" className="hover:text-black/80 transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-black/80 transition">
            About
          </Link>
          <Link to="/services" className="hover:text-black/80 transition">
            Services
          </Link>
          <Link to="/contact" className="hover:text-black/80 transition">
            Coummunity
          </Link>
          <Link to="/meet-the-team" className="hover:text-black/80 transition">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <Link to="/login" className=" transition font-medium">
            Login
          </Link>

          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/70 font-medium  transition active:scale-[0.98]"
          >
            Ready To Launch
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
