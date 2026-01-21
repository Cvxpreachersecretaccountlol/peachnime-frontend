/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa";
import Heading from "../components/Heading";
import MiniPoster from "../components/MiniPoster";

const DynamicLayout = ({ title, data, endpoint }) => {
  return (
    <div className="col-span-12 md:col-span-6 mt-5 xl:col-span-3">
      <Heading className="mb-3">{title}</Heading>
      <div className="items glass rounded-2xl px-4 py-4 h-auto w-full flex flex-col border border-violet-500/10">
        {data && data.map((item) => <MiniPoster key={item.id} item={item} />)}
        <div className="more my-2 mt-4">
          <Link
            className="flex hover:text-primary items-center gap-2 text-sm font-medium transition-colors group"
            to={`/animes/${endpoint}`}
          >
            <span>View More</span>
            <FaAngleRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DynamicLayout;
