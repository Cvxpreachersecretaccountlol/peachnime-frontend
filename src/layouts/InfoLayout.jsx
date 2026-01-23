/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import SoundsInfo from "../components/SoundsInfo";
import { Link } from "react-router-dom";
import { FaCirclePlay, FaHeart, FaRegHeart } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa";
import CircleRatting from "../components/CircleRatting";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabase";
import { useNavigate } from "react-router-dom";

const InfoLayout = ({ data, showBigPoster }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showFull, setShowFull] = useState(false);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfInList();
    }
  }, [user, data]);

  const checkIfInList = async () => {
    try {
      const { data: listData, error } = await supabase
        .from('my_list')
        .select('id')
        .eq('user_id', user.id)
        .eq('anime_id', data.id)
        .single();

      if (listData) setInList(true);
    } catch (error) {
      // Not in list
      setInList(false);
    }
  };

  const toggleList = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      if (inList) {
        // Remove from list
        const { error } = await supabase
          .from('my_list')
          .delete()
          .eq('user_id', user.id)
          .eq('anime_id', data.id);

        if (error) throw error;
        setInList(false);
      } else {
        // Add to list
        const { error } = await supabase
          .from('my_list')
          .insert({
            user_id: user.id,
            anime_id: data.id,
            anime_title: data.title,
            anime_image: data.poster
          });

        if (error) throw error;
        setInList(true);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    "#d0e6a5",
    "#ffbade",
    "#fc887b",
    "#ccabda",
    "#abccd8",
    "#d8b2ab",
    "#86e3ce",
  ];

  return (
    <>
      <div className="banner min-h-[700px] relative w-full bg-[#262525] pt-10 md:pt-20">
        <div className="backdrop-img bg-backGround w-full h-full absolute top-0 left-0 overflow-hidden opacity-[.1]">
          <img
            src={data.poster}
            alt={data.title}
            className="object-cover object-center h-full w-full"
            loading="lazy"
          />
        </div>
        <div className="opacity-overlay"></div>
        <div className="content max-w-[1200px] w-full mx-auto flex flex-col items-start md:flex-row gap-2 mb-2 relative px-2">
          <div className="left w-full md:w-60 xl:w-80 flex justify-center">
            <div
              className="posterImg px-5 md:w-full cursor-pointer"
              onClick={() => showBigPoster(data.poster)}
            >
              <img
                src={data.poster}
                alt={data.title}
                className="rounded-md h-full w-full"
              />
            </div>
          </div>
          <div className="right mt-3 w-full flex flex-col gap-2">
            <div className="path hidden md:flex items-center gap-2 text-base ">
              <Link className="" to="/home">
                <h4 className="">home</h4>
              </Link>
              <span className="h-1 w-1 rounded-full bg-primary"></span>
              <Link to={`/animes/${data.type.toLowerCase()}`}>
                <h4 className="hover:text-primary">{data.type}</h4>
              </Link>
              <span className="h-1 w-1  rounded-full bg-primary"></span>
              <h4 className="gray">{data.title}</h4>
            </div>
            <h1 className="title text-lg md:text-4xl font-extrabold">
              {data.title}
            </h1>
            <div className="alternative gray text-lg font-bold">
              {data.alternativeTitle}
            </div>
            <div className="alternative gray text-lg font-bold">
              {data.japanese}
            </div>
            
            {/* Watch Now and Add to List Buttons */}
            <div className="flex gap-3 my-4">
              <Link
                to={`/watch/${data.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                <FaCirclePlay className="text-xl" />
                Watch Now
              </Link>
              
              <button
                onClick={toggleList}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  inList
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {inList ? (
                  <>
                    <FaHeart className="text-xl text-red-300" />
                    In My List
                  </>
                ) : (
                  <>
                    <FaRegHeart className="text-xl" />
                    Add to List
                  </>
                )}
              </button>
            </div>

            <div className="sounds flex items-center gap-2 my-2">
              <SoundsInfo
                episodes={{
                  rating: data.rating,
                  ...data.episodes,
                }}
              />
              <span className="h-1 w-1 rounded-full bg-primary"></span>
              <span className="type text-[#ccc] text-sm font-bold">
                {data.type}
              </span>
              <span className="h-1 w-1 rounded-full bg-primary"></span>
              <span className="duration text-[#ccc] text-sm font-bold">
                {data.duration}
              </span>
            </div>

            <div className="genres flex gap-2 flex-wrap">
              {data.genres.map((genre, i) => {
                const color = colors[i % colors.length];
                return (
                  <Link
                    key={i}
                    to={`/animes/genre/${genre}`}
                    style={{ color }}
                    className="text-sm font-bold p-2 bg-[#444] rounded-md hover:scale-105 transition-transform"
                  >
                    {genre}
                  </Link>
                );
              })}
            </div>

            <div className="rating flex items-center gap-3 my-2">
              <CircleRatting rating={data.rating} />
              <div className="aired">
                <p className="text-[#ccc] text-sm">
                  {data.aired && data.aired.string}
                </p>
              </div>
            </div>

            <div className="synopsis">
              <h3 className="text-xl font-bold mb-2">Synopsis:</h3>
              <p
                className={`text-[#ccc] text-sm ${
                  showFull ? "" : "line-clamp-3"
                }`}
              >
                {data.description}
              </p>
              {data.description.length > 200 && (
                <button
                  onClick={() => setShowFull(!showFull)}
                  className="text-primary text-sm font-bold mt-2 flex items-center gap-2 hover:gap-3 transition-all"
                >
                  {showFull ? "Show Less" : "Read More"}
                  <FaArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoLayout;
