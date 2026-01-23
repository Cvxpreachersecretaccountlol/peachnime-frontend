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
import CommentSection from "../components/CommentSection";

const WatchPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState("row");
  
  const ep = searchParams.get("ep");

  const { data, isError } = useApi(`/episodes/${id}`);
  const episodes = data?.data;

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
        <meta property="og:title" content={`watch - peachnime`} />
      </Helmet>
      <div className="flex flex-col gap-2">
        <div className="path flex mb-2 mx-2 items-center gap-2 text-base">
          <Link className="" to="/home">
            <h4 className="hover:text-primary">home</h4>
          </Link>
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          <Link to={`/anime/${id}`}>
            <h4 className="hover:text-primary">
              {id.split("-").slice(0, 2).join(" ")}
            </h4>
          </Link>
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          <h4 className="gray">{`episode ${currentEp.episodeNumber}`}</h4>
        </div>
        {ep && id && (
          <Player
            id={id}
            episodeId={`${id}?ep=${ep}`}
            currentEp={currentEp}
            changeEpisode={changeEpisode}
            hasNextEp={hasNextEp}
            hasPrevEp={hasPrevEp}
          />
        )}

        {/* Comment Section - Right after player */}
        <CommentSection 
          animeId={id} 
          episodeNumber={parseInt(ep) || 1}
        />

        <div className="flex justify-end gap-2 px-2 items-center">
          <p className="text-sm gray">layout:</p>
          <button onClick={() => setLayout("col")}>
            <HiMiniViewColumns
              className={`text-xl ${
                layout === "col" ? "text-primary" : "text-white"
              }`}
            />
          </button>
          <button onClick={() => setLayout("row")}>
            <MdTableRows
              className={`text-xl ${
                layout === "row" ? "text-primary" : "text-white"
              }`}
            />
          </button>
        </div>
        <Episodes
          layout={layout}
          data={episodes}
          selectedEp={ep}
          onClick={updateParams}
        />
      </div>
    </div>
  );
};

export default WatchPage;
