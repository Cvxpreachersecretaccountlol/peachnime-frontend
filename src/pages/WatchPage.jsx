import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Loader from "../components/Loader";
import Player from "../components/Player";
import Episodes from "../layouts/Episodes";
import { useApi } from "../services/useApi";
import PageNotFound from "./PageNotFound";
import { MdTableRows } from "react-icons/md";
import { HiMiniViewColumns } from "react-icons/hi2";
import { Helmet } from "react-helmet";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabase";
import { FaClock } from "react-icons/fa";

const WatchPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState("row");
  const [resumeTime, setResumeTime] = useState(null);
  const [showResumeMessage, setShowResumeMessage] = useState(false);
  
  const ep = searchParams.get("ep");

  // Fetch episodes
  const { data, isError } = useApi(`/episodes/${id}`);
  const episodes = data?.data;

  // Fetch anime details for watch history
  const { data: animeDataResponse } = useApi(`/anime/${id}`);
  const animeData = animeDataResponse?.data;

  // Check if user has watch history for this episode
  useEffect(() => {
    if (user && id && ep) {
      checkResumeTime();
    }
  }, [user, id, ep]);

  const checkResumeTime = async () => {
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('time_watched')
        .eq('user_id', user.id)
        .eq('anime_id', id)
        .eq('episode_number', parseInt(ep))
        .single();

      if (data && data.time_watched > 30) {
        setResumeTime(data.time_watched);
        setShowResumeMessage(true);
        // Hide message after 10 seconds
        setTimeout(() => setShowResumeMessage(false), 10000);
      }
    } catch (error) {
      // No watch history found
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateParams = (newParam) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("ep", newParam);
      return newParams;
    });
  };

  useEffect(() => {
    if (!ep && Array.isArray(episodes) && episodes.length > 0) {
      const ep = episodes[0].id.split("ep=").pop();
      updateParams(ep);
    }
  }, [ep, episodes, setSearchParams]);

  if (isError) {
    return <PageNotFound />;
  }

  if (!episodes) {
    return <Loader className="h-screen" />;
  }

  const currentEp =
    episodes &&
    ep !== null &&
    episodes.find((e) => e.id.split("ep=").pop() === ep);

  const changeEpisode = (action) => {
    if (action === "next") {
      const nextEp = episodes[currentEp.episodeNumber - 1 + 1];
      if (!nextEp) return;
      updateParams(nextEp.id.split("ep=").pop());
    } else {
      const prevEp = episodes[currentEp.episodeNumber - 1 - 1];
      if (!prevEp) return;
      updateParams(prevEp.id.split("ep=").pop());
    }
  };

  const hasNextEp = Boolean(episodes[currentEp.episodeNumber - 1 + 1]);
  const hasPrevEp = Boolean(episodes[currentEp.episodeNumber - 1 - 1]);

  return (
    <div className="bg-backGround pt-14 max-w-screen-xl mx-auto py-2 md:px-2">
      <Helmet>
        <title>
          Watch {id.split("-").slice(0, 2).join(" ")} Online, Free Anime
          Streaming Online on Peachnime 🍑
        </title>
        <meta property="og:title" content="watch - peachnime" />
      </Helmet>
      <div className="flex flex-col gap-2">
        <div className="path flex mb-2 mx-2 items-center gap-2 text-base ">
          <Link className="" to="/home">
            <h4 className="hover:text-primary">home</h4>
          </Link>
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          <Link to={`/anime/${id}`}>
            <h4 className="hover:text-primary">
              {animeData?.title || id.split("-").slice(0, 2).join(" ")}
            </h4>
          </Link>
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          <h4 className="gray">{`episode ${currentEp.episodeNumber}`}</h4>
        </div>

        {/* Resume Time Message */}
        {showResumeMessage && resumeTime && (
          <div className="mx-2 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/40 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <FaClock className="text-2xl text-violet-400" />
            <div className="flex-1">
              <p className="font-bold text-white">Resume from {formatTime(resumeTime)}</p>
              <p className="text-sm text-gray-300">Seek to this time in the video player to continue where you left off</p>
            </div>
            <button
              onClick={() => setShowResumeMessage(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {ep && id && (
          <Player
            id={id}
            episodeId={`${id}?ep=${ep}`}
            currentEp={currentEp}
            changeEpisode={changeEpisode}
            hasNextEp={hasNextEp}
            hasPrevEp={hasPrevEp}
            animeData={animeData}
          />
        )}
        <div className="input w-full mt-2 flex items-end justify-end gap-3 text-end">
          <div className="btns bg-btnbg flex mx-2 rounded-child">
            <button
              className={`row item p-2 ${
                layout === "row" ? "bg-primary text-black" : undefined
              }`}
              onClick={() => setLayout("row")}
            >
              <MdTableRows size={"20px"} />
            </button>
            <button
              className={`column item p-2 ${
                layout === "column" ? "bg-primary text-black" : undefined
              }`}
              onClick={() => setLayout("column")}
            >
              <HiMiniViewColumns size={"20px"} />
            </button>
          </div>
        </div>
        <ul
          className={`episodes max-h-[50vh] py-4 px-2 overflow-scroll bg-lightbg grid gap-1  md:gap-2 ${
            layout === "row"
              ? " grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : " grid-cols-5 md:grid-cols-10"
          }`}
        >
          {episodes?.map((episode) => (
            <Episodes
              key={episode.id}
              episode={episode}
              currentEp={currentEp}
              layout={layout}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WatchPage;
