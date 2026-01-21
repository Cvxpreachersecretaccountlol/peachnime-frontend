import React from "react";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import AZ from "../layouts/AZ";
import { FaInstagram, FaDiscord, FaHeart } from "react-icons/fa6";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 mb-8">
      <div className="glass rounded-2xl border border-violet-500/10 p-8 mx-2 md:mx-4">
        <div className="logo w-full flex justify-center items-center mb-6">
          <Logo />
        </div>

        <div className="border-t border-violet-500/20 my-6"></div>

        <div className="az-list mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
            <p className="text-primary font-bold text-sm">A-Z List</p>
            <p className="text-gray-400 text-sm">
              Browse anime alphabetically from A to Z
            </p>
          </div>
          <AZ />
        </div>

        <div className="border-t border-violet-500/20 my-6"></div>

        <div className="disclaimer flex flex-col justify-center items-center gap-4">
          <p className="text-sm text-center text-gray-400 max-w-2xl">
            Kamanime does not store any files on our servers. We only provide
            links to media hosted on third-party services.
          </p>

          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <span>Made with</span>
            <FaHeart className="text-primary animate-pulse" />
            <span>for anime fans</span>
          </div>

          <p className="text-gray-500 text-sm">
            © {currentYear} Kamanime. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex justify-center items-center gap-6 mt-2">
            <motion.a
              href="https://discord.gg/pAcf7RGxuy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary text-2xl transition-colors"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaDiscord />
            </motion.a>

            <motion.a
              href="https://www.instagram.com/kamanime.xyz?igsh=NW5rMm5obTM5aHA="
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary text-2xl transition-colors"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaInstagram />
            </motion.a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            <Link
              to="/home"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/animes/movie"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              Movies
            </Link>
            <Link
              to="/animes/tv"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              TV Series
            </Link>
            <Link
              to="/animes/most-popular"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              Popular
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
