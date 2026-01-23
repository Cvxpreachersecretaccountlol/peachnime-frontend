import { useState } from "react";
import { FaAlignJustify } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoginButton from "./LoginButton";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", id: "/home" },
    { name: "Movies", id: "/animes/movie" },
    { name: "TV Series", id: "/animes/tv" },
    { name: "Most Popular", id: "/animes/most-popular" },
    { name: "Top Airing", id: "/animes/top-airing" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav>
      <div className="nav hidden md:flex justify-center items-center gap-6">
        <ul className="flex gap-8 lg:gap-10">
          {navLinks.map((item) => (
            <li key={item.id} className="relative">
              <Link
                className={`font-medium transition-all duration-300 hover:text-primary ${
                  isActive(item.id)
                    ? 'text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                    : 'text-gray-300'
                }`}
                to={item.id}
              >
                {item.name}
                {isActive(item.id) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-cyan-500 to-magenta-500 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
        
        <LoginButton />
      </div>

      <div className="block md:hidden relative w-full">
        <div className="flex justify-between items-center px-5 pt-5">
          <button onClick={() => setShow(!show)}>
            <h1 className="flex justify-start items-center gap-2 text-gray-300 font-medium">
              <FaAlignJustify />
              Menu
            </h1>
          </button>
          
          <LoginButton />
        </div>

        <AnimatePresence>
          {show && (
            <motion.ul
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-11/12 mx-3 absolute flex flex-col justify-center items-center z-10 glass rounded-2xl py-5 gap-3 border border-violet-500/20 mt-4"
            >
              {navLinks.map((item) => (
                <li
                  className={`w-full text-center py-2 px-4 rounded-xl transition-all ${
                    isActive(item.id)
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-violet-500/10 text-gray-300'
                  }`}
                  key={item.id}
                  onClick={() => setShow(false)}
                >
                  <Link to={item.id}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
