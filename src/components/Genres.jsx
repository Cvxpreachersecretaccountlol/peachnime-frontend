import { Link } from "react-router-dom";

const Genres = () => {
  const genres = [
    "action",
    "adventure",
    "cars",
    "comedy",
    "dementia",
    "demons",
    "drama",
    "ecchi",
    "fantasy",
    "game",
    "harem",
    "historical",
    "horror",
    "isekai",
    "josei",
    "kids",
    "magic",
    "martial arts",
    "mecha",
    "military",
    "music",
    "mystery",
    "parody",
    "police",
    "psychological",
    "romance",
    "samurai",
    "school",
    "sci-fi",
    "seinen",
    "shoujo",
    "shoujo ai",
    "shounen",
    "shounen ai",
    "slice of life",
    "space",
    "sports",
    "super power",
    "supernatural",
    "thriller",
    "vampire",
  ];

  return (
    <div className="px-2 pb-4">
      <h2 className="text-xl font-bold text-primary mb-4">genres</h2>
      <div className="grid grid-cols-2 gap-2">
        {genres.map((genre, i) => (
          <Link
            key={i}
            to={`/animes/genre/${genre}`}
            className="hover:text-primary capitalize text-sm py-1"
          >
            {genre}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Genres;
