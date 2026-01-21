/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import SoundsInfo from "./SoundsInfo";
import { motion } from "framer-motion";

const MiniPoster = ({ item }) => {
  return (
    <motion.div 
      key={item.id} 
      className="flex border-b border-violet-500/10 last:border-b-0 pb-3 items-center gap-4 group hover:bg-violet-500/5 p-2 rounded-xl transition-all duration-300"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link className="" to={`/anime/${item.id}`}>
        <div className="poster bg-surface rounded-xl flex-shrink-0 relative overflow-hidden w-16 pb-[85px] group-hover:shadow-neon-sm transition-all duration-300">
          <img
            className="h-full absolute w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
            src={item.poster}
            alt={item.title}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
      <div className="text flex-1">
        <Link to={`/anime/${item.id}`}>
          <h2 className="title hover:text-primary mb-2 font-semibold line-clamp-2 transition-colors">
            {item.title}
          </h2>
        </Link>
        <div className="item flex items-center">
          <SoundsInfo episodes={item.episodes} />
          {item.type && (
            <>
              <span className="block mx-1 h-1 w-1 bg-primary rounded-full"></span>
              <h2 className="text-xs text-gray-400">{item.type}</h2>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MiniPoster;
