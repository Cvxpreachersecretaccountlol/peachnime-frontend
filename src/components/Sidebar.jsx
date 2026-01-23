import useSidebarStore from "../store/sidebarStore";
import { Link, useLocation } from "react-router-dom";
import Genres from "./Genres";
import { useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";

const Sidebar = () => {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const sidebarHandler = useSidebarStore((state) => state.toggleSidebar);

  const location = useLocation();
  const key = location.key;

  useEffect(() => {
    isSidebarOpen ? sidebarHandler() : null;
  }, [key]);

  const list = [
    { name: "Home", link: "/home" },
    { name: "Profile", link: "/profile" },
    { name: "Continue Watching", link: "/continue-watching" },
    { name: "My List", link: "/my-list" },
    { name: "History", link: "/history" },
    { name: "Subbed Anime", link: "/animes/subbed-anime" },
    { name: "Dubbed Anime", link: "/animes/dubbed-anime" },
    { name: "Most Popular", link: "/animes/most-popular" },
    { name: "Top Airing", link: "/animes/top-airing" },
    { name: "most favorite", link: "/animes/most-favorite" },
    { name: "latest completed", link: "/animes/completed" },
    { name: "recently added", link: "/animes/recently-added" },
    { name: "recently updated", link: "/animes/recently-updated" },
    { name: "top upcoming", link: "/animes/top-upcoming" },
    { name: "A-Z List", link: "/animes/az-list/a" },
    { name: "Movies", link: "/animes/movie" },
    { name: "OVAs", link: "/animes/ova" },
    { name: "ONAs", link: "/animes/ona" },
    { name: "Specials", link: "/animes/special" },
  ];

  return (
    <div
      className={`sidebar transition-all fixed overflow-scroll h-full z-[100] inset-0 w-64 md:w-80 bg-[rgba(10,10,15,0.95)] backdrop-blur-xl ${
        isSidebarOpen ? "translate-x-0" : "translate-x-[-100%]"
      }`}
    >
      <button
        className="w-full pt-4 pl-2 flex items-center gap-2 hover:text-primary text-base md:text-xl"
        onClick={sidebarHandler}
      >
        <FaAngleLeft />
        <span>close menu</span>
      </button>
      <ul className="py-4">
        {list.map((item, i) => (
          <li key={i} className="pl-2 py-2">
            <Link
              className="hover:text-primary capitalize text-base"
              to={item.link}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <Genres />
    </div>
  );
};

export default Sidebar;
