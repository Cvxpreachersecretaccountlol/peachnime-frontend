/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { useState } from "react";
import {
  TbPlayerTrackPrevFilled,
  TbPlayerTrackNextFilled,
} from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabase";

const Player = ({
  episodeId,
  currentEp,
  changeEpisode,
  hasNextEp,
  hasPrevEp,
  id,
  animeData,
}) => {
  const { user } = useAuth();
  const [category, setCategory] = useState("sub");
  const [server, setServer] = useState("vidWish");
  const watchIntervalRef = useRef(null);

  useEffect(() => {
    // Wait for animeData to load before saving
    if (user && id && currentEp) {
      // Delay to ensure animeData is loaded
      const timer = setTimeout(() => {
        saveWatchHistory();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, id, currentEp?.episodeNumber, animeData]);

  useEffect(() => {
    // Track watch time
    if (user) {
      watchIntervalRef.current = setInterval(() => {
        updateWatchTime();
      }, 10000);
    }

    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
      }
    };
  }, [user, id, currentEp?.episodeNumber]);

  const saveWatchHistory = async () => {
    if (!user || !id || !currentEp) return;

    try {
      // Get anime title and poster from animeData or use fallback
      const animeTitle = animeData?.title || id.split('-').slice(0, -1).join(' ');
      const animePoster = animeData?.poster || '';

      console.log('Saving watch history:', {
        anime_title: animeTitle,
        anime_image: animePoster,
        episode: currentEp.episodeNumber
      });

      await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          anime_id: id,
          anime_title: animeTitle,
          anime_image: animePoster,
          episode_number: currentEp.episodeNumber,
          episode_id: episodeId,
          time_watched: 0,
          total_duration: 1500,
          last_watched_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,anime_id,episode_number'
        });
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  };

  const updateWatchTime = async () => {
    if (!user || !id || !currentEp) return;

    try {
      const { data: existing } = await supabase
        .from('watch_history')
        .select('time_watched')
        .eq('user_id', user.id)
        .eq('anime_id', id)
        .eq('episode_number', currentEp.episodeNumber)
        .single();

      if (existing) {
        await supabase
          .from('watch_history')
          .update({
            time_watched: (existing.time_watched || 0) + 10,
            last_watched_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('anime_id', id)
          .eq('episode_number', currentEp.episodeNumber);
      }
    } catch (error) {
      console.error('Error updating watch time:', error);
    }
  };

  const changeCategory = (newType) => {
    if (newType !== category) {
      setCategory(newType);
    }
  };

  function changeServer(newServer) {
    if (newServer !== server) setServer(newServer);
  }

  return (
    <>
      <div className="w-full bg-background aspect-video relative rounded-sm max-w-screen-xl overflow-hidden">
        <iframe
          src={`https://${
            server === "vidWish" ? "vidwish.live" : "megaplay.buzz"
          }/stream/s-2/${episodeId.split("ep=").pop()}/${category}`}
          width="100%"
          height="100%"
          allowFullScreen
        ></iframe>
      </div>
      <div className="category flex flex-wrap flex-col sm:flex-row items-center justify-center sm:justify-between px-2 md:px-20 gap-3 bg-lightbg py-2">
        <div className="servers flex gap-4">
          <button
            onClick={() => changeServer("vidWish")}
            className={`${
              server === "vidWish"
                ? "bg-primary text-black"
                : "bg-btnbg text-white"
            } px-2 py-1 rounded text-sm font-semibold`}
          >
            vidwish
          </button>
          <button
            onClick={() => changeServer("megaPlay")}
            className={`${
              server === "megaPlay"
                ? "bg-primary text-black"
                : "bg-btnbg text-white"
            } px-2 py-1 rounded text-sm font-semibold`}
          >
            megaplay
          </button>
        </div>
        <div className="flex gap-5">
          <div className="sound flex gap-3">
            {["sub", "dub"].map((type) => (
              <button
                key={type}
                onClick={() => changeCategory(type)}
                className={`${
                  category === type
                    ? "bg-primary text-black"
                    : "bg-btnbg text-white"
                } px-2 py-1 rounded text-sm font-semibold`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="btns flex gap-4">
            {hasPrevEp && (
              <button
                title="prev"
                className="prev bg-primary px-2 py-1 rounded-md text-black"
                onClick={() => changeEpisode("prev")}
              >
                <TbPlayerTrackPrevFilled />
              </button>
            )}
            {hasNextEp && (
              <button
                title="next"
                className="next bg-primary px-2 py-1 rounded-md text-black"
                onClick={() => changeEpisode("next")}
              >
                <TbPlayerTrackNextFilled />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-gray-400">
            you are watching Episode {currentEp.episodeNumber}
          </p>
          {currentEp.isFiller && (
            <p className="text-red-400">your are watching filler Episode 👻</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Player;
