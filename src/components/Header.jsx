import { useRef, useState } from "react";
import { FaArrowCircleRight, FaBars, FaSearch } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useApi } from "../services/useApi";
import Logo from "./Logo";
import useSidebarStore from "../store/sidebarStore";
import Loader from "./Loader";

const Header = () => {
  const sidebarHandler = useSidebarStore((state) => state.toggleSidebar);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(""); // For debouncing
  const timeoutRef = useRef(null);

  const navigate = useNavigate();

  // Debounce input value
  const changeInput = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue); // Set debounced value after 1 second
    }, 500);
  };

  // React Query hook with `useApi`
  const { data, isLoading, isError, error } = useApi(
    debouncedValue.length > 2 ? `/suggestion?keyword=${debouncedValue}` : null
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?keyword=${value}`);
    resetSearch();
  };

  const navigateToAnimePage = (id) => {
    navigate(`/anime/${id}`);
    resetSearch();
  };
  const resetSearch = () => {
    setValue("");
    setDebouncedValue("");
    setShowSearchBar(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  const emptyInput = () => {
    setValue("");
    setDebouncedValue("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  return (
    <div className="relative z-[100]">
      <div className="fixed glass w-full py-3 md:py-4 shadow-lg border-b border-violet-500/10">
        <div className="flex gap-2 px-5 md:px-10 md:gap-5 justify-between items-center">
          <div className="left flex gap-2 md:gap-5 items-center">
            <div className="menu cursor-pointer hover:text-primary transition-colors" onClick={sidebarHandler}>
              <FaBars size={25} />
            </div>
            <Logo />
          </div>
          <div className="right justify-end lg:basis-[40%] flex gap-3 md:gap-5 items-center">
            <button
              className="text-xl hover:text-primary transition-colors p-2"
              onClick={() => setShowSearchBar(!showSearchBar)}
              aria-label="Toggle search"
            >
              {showSearchBar ? <FaXmark /> : <FaSearch />}
            </button>
          </div>
        </div>
        <form
          action={`/search?keyword=${value}`}
          onSubmit={handleSubmit}
          className={`search mt-3 px-4 md:px-6 relative items-center w-full ${
            showSearchBar ? "flex" : "hidden"
          }`}
        >
          <input
            value={value}
            onChange={changeInput}
            placeholder="Search your favorite anime..."
            type="text"
            className="header-search w-full glass px-4 py-3 text-base md:text-lg rounded-2xl border border-violet-500/20 focus:border-primary/50 transition-all outline-none placeholder:text-gray-500"
          />
          <div className="btns absolute right-8 md:right-12 flex justify-center items-center gap-3">
            {value.length > 1 && (
              <button onClick={emptyInput} type="reset" className="hover:text-primary transition-colors">
                <FaXmark />
              </button>
            )}
            <button type="submit" className="hover:text-primary transition-colors">
              <FaSearch />
            </button>
          </div>
        </form>
        <div className={`${showSearchBar ? "flex flex-col mt-4 px-4 md:px-6" : "hidden"}`}>
          {isLoading ? (
            <Loader />
          ) : data && data?.data.length ? (
            <>
              <div className="glass rounded-2xl border border-violet-500/20 overflow-hidden">
                {data?.data?.map((item) => (
                  <div
                    onClick={() => navigateToAnimePage(item.id)}
                    className="flex w-full justify-start items-start hover:bg-violet-500/10 px-4 py-4 gap-4 cursor-pointer transition-all border-b border-violet-500/10 last:border-b-0"
                    key={item.id}
                  >
                    <div className="poster shrink-0 pb-14 relative w-10 rounded-lg overflow-hidden">
                      <img
                        className="h-full w-full inset-0 absolute object-cover object-center"
                        src={item.poster}
                        alt={item.title}
                      />
                    </div>
                    <div className="info">
                      <h4 className="title line-clamp-2 font-medium">{item.title}</h4>
                      <h6 className="text-gray-400 text-sm line-clamp-1 mt-1">
                        {item.alternativeTitle}
                      </h6>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                        <h6>{item.aired}</h6>
                        <span className="h-1 w-1 rounded-full bg-primary"></span>
                        <h6>{item.type}</h6>
                        <span className="h-1 w-1 rounded-full bg-primary"></span>
                        <h6>{item.duration}</h6>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="w-full py-3 flex justify-center items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 transition-all font-semibold"
                  onClick={handleSubmit}
                >
                  <span>View More</span>
                  <FaArrowCircleRight />
                </button>
              </div>
            </>
          ) : (
            <>
              {value.length > 2 && (
                <h1 className="text-center text-lg text-primary py-4">
                  Anime not found 😔
                </h1>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
