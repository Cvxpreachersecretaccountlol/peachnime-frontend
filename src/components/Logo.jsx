import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Logo = () => {
  return (
    <Link to={"/home"}>
      <motion.div 
        className="flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <img 
          src="/kamanime-logo.png" 
          alt="Kamanime" 
          className="h-10 w-10 md:h-12 md:w-12 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
        />
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-magenta-400 bg-clip-text text-transparent select-none">
          Kamanime
        </h1>
      </motion.div>
    </Link>
  );
};

export default Logo;
