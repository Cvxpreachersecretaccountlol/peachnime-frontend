/* eslint-disable react/prop-types */
import SoundsInfo from "../components/SoundsInfo";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";

const Image = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/anime/${data.id}`}>
        <div className="film-poster relative rounded-2xl w-full h-full pb-[140%] mb-3 overflow-hidden bg-surface/50 block">
          <div className="z-10 opacity-90 absolute bottom-2 left-2">
            <SoundsInfo episodes={data.episodes} />
          </div>
          <LazyLoadImage
            className="absolute h-full w-full inset-0 object-cover object-center transition-transform duration-500 group-hover:scale-110"
            wrapperClassName="h-full w-full absolute"
            effect="blur"
            src={data.poster}
            alt={data.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-primary/90 rounded-full p-4 shadow-neon"
            >
              <FaPlay className="text-white text-2xl" />
            </motion.div>
          </div>
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-all duration-300" />
        </div>
      </Link>
      <Link to={`/anime/${data.id}`}>
        <div
          title={data.title}
          className="title line-clamp-2 text-sm md:text-base font-medium hover:text-primary transition-colors duration-300 mb-1"
        >
          <h1>{data.title}</h1>
        </div>
      </Link>
      {data.type && (
        <div className="type flex text-gray-400 gap-2 items-center text-xs md:text-sm">
          <h4>{data.type}</h4>
          <div className="h-1 w-1 bg-primary rounded-full"></div>
          <h4>{data.duration}</h4>
        </div>
      )}
    </motion.div>
  );
};

export default Image;
