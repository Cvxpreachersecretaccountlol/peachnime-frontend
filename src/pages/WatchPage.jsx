import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import EpisodeList from "../components/EpisodeList";
import useFetchAnimeInfo from "../hooks/useFetchAnimeInfo";
import useFetchEpisodeServers from "../hooks/useFetchEpisodeServers";
import CommentsSection from "../components/CommentsSection";

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [selectedServer, setSelectedServer] = useState(null);
  
  const { animeInfo, loading: infoLoading } = useFetchAnimeInfo(id);
  const { servers, loading: serversLoading } = useFetchEpisodeServers(
    id,
    currentEpisode
  );

  useEffect(() => {
    if (servers && servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0]);
    }
  }, [servers, selectedServer]);

  const handleEpisodeChange = (episodeNumber) => {
    setCurrentEpisode(episodeNumber);
    setSelectedServer(null);
  };

  const handleServerChange = (server) => {
    setSelectedServer(server);
  };

  if (infoLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-2xl">Loading... 🍑</div>
      </div>
    );
  }

  if (!animeInfo) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-2xl">Anime not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Video Player */}
        <div className="mb-6">
          <VideoPlayer
            src={selectedServer?.url}
            poster={animeInfo.coverImage}
            loading={serversLoading}
            servers={servers}
            selectedServer={selectedServer}
            onServerChange={handleServerChange}
          />
        </div>

        {/* Anime Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{animeInfo.title}</h1>
          <p className="text-gray-400">
            Episode {currentEpisode} of {animeInfo.totalEpisodes}
          </p>
        </div>

        {/* Episode List */}
        <EpisodeList
          totalEpisodes={animeInfo.totalEpisodes}
          currentEpisode={currentEpisode}
          onEpisodeChange={handleEpisodeChange}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
        >
          ← Back
        </button>
      </div>

      {/* Comments Section */}
      <CommentsSection animeId={id} episodeNumber={currentEpisode} />
    </div>
  );
};

export default WatchPage;
