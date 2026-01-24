import { Link } from "react-router-dom";
import useSidebarStore from "../store/sidebarStore";
import { X } from "lucide-react";
import { FaDiscord, FaInstagram } from "react-icons/fa6";

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();

  const menuItems = [
    { name: "Home", path: "/home" },
    { name: "Subbed Anime", path: "/animes/sub" },
    { name: "Dubbed Anime", path: "/animes/dub" },
    { name: "Most Popular", path: "/animes/most-popular" },
    { name: "Movies", path: "/animes/movie" },
    { name: "TV Series", path: "/animes/tv" },
    { name: "OVAs", path: "/animes/ova" },
    { name: "ONAs", path: "/animes/ona" },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#1a1a2e] z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
      >
        <div className="p-6">
          <button
            onClick={toggleSidebar}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-all"
          >
            <X size={24} />
            <span className="text-lg">Close menu</span>
          </button>

          <div className="flex gap-4 mb-8">
            <a
              href="https://discord.gg/ajv9JQbMGb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#5865F2] rounded-xl hover:bg-[#4752C4] transition-all"
            >
              <FaDiscord size={24} />
              <span className="font-semibold">Discord</span>
            </a>
            <a
              href="https://www.instagram.com/peachnime.insta?igsh=dWcwZjI3NXl3OG92"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl hover:shadow-lg transition-all"
            >
              <FaInstagram size={24} />
              <span className="font-semibold">Instagram</span>
            </a>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={toggleSidebar}
                className="block px-4 py-3 text-white hover:bg-violet-500/20 rounded-xl transition-all text-lg"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
