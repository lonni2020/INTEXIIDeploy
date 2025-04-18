import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Movie } from "../types/Movies";
import MovieCard from "../components/MovieCard";
import GenreCarousel from "../components/GenreCarousel";
import "../styles/SearchPage.css";
import AuthorizeView from "../components/AuthorizeView";
import { fetchAllMovies } from "../api/MovieAPI";

// Mapping of sub-genres to the corresponding API fields.
const subGenreMap: { [key: string]: string[] } = {
  action: ["action", "tvAction"],
  adventure: ["adventure"],
  anime: ["animeSeriesInternationalTvShows"],
  british: ["britishTvShowsDocuseriesInternationalTvShows"],
  children: ["children"],
  comedies: [
    "comedies",
    "tvComedies",
    "comediesInternationalMovies",
    "comediesRomanticMovies",
    "comediesDramasInternationalMovies",
  ],
  crime: ["crimeTvShowsDocuseries"],
  docuseries: [
    "docuseries",
    "britishTvShowsDocuseriesInternationalTvShows",
    "crimeTvShowsDocuseries",
  ],
  dramas: [
    "dramas",
    "dramasInternationalMovies",
    "dramasRomanticMovies",
    "tvDramas",
    "internationalTvShowsRomanticTvShowsTvDramas",
  ],
  family: ["familyMovies", "children", "kidsTv"],
  fantasy: ["fantasy"],
  horror: ["horrorMovies"],
  international: [
    "animeSeriesInternationalTvShows",
    "britishTvShowsDocuseriesInternationalTvShows",
    "dramasInternationalMovies",
    "documentariesInternationalMovies",
    "comediesInternationalMovies",
    "internationalMoviesThrillers",
    "internationalTvShowsRomanticTvShowsTvDramas",
  ],
  musicals: ["musicals"],
  nature: ["natureTv"],
  reality: ["realityTv"],
  romance: ["internationalTvShowsRomanticTvShowsTvDramas"],
  spiritual: ["spirituality"],
  talkShows: ["talkShowsTvComedies"],
  thrillers: ["thrillers", "internationalMoviesThrillers"],
};

const SearchPage: React.FC = () => {
  // Raw movie data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState(""); // Filters, search & sort

  const [searchTerm, setSearchTerm] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [genreFilters, setGenreFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("default");
  const [ratingFilter, setRatingFilter] = useState<string>("all"); // Pagination

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 30; // Retrieve all movies in the database

  useEffect(() => {
    fetchAllMovies()
      .then(setMovies)
      .catch((err) => setError(err.message));
  }, []); // Handlers

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMediaTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }; // Toggle a sub-genre filter when the user clicks on a genre in the carousel.

  const handleGenreChange = (subGenre: string) => {
    setCurrentPage(1);
    setGenreFilters((prev) =>
      prev.includes(subGenre)
        ? prev.filter((g) => g !== subGenre)
        : [...prev, subGenre]
    );
  }; // Filter logic:
  // 1. Search by title.
  // 2. Filter by media type.
  // 3. For genre filters, use OR: a movie passes if it matches ANY of the selected genres.

  const filteredMovies = movies
    .filter((m) => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((m) => {
      if (mediaTypeFilter === "all") return true;
      if (mediaTypeFilter === "movie") {
        return m.typeField?.toLowerCase().includes("movie");
      } else if (mediaTypeFilter === "tv") {
        return m.typeField?.toLowerCase().includes("tv");
      }
      return true;
    })
    .filter((m) => {
      if (genreFilters.length === 0) return true;
      return genreFilters.some((subGenre) => {
        const fields = subGenreMap[subGenre]; // Movie passes if any field for this sub-genre equals 1
        return fields.some((field) => (m as any)[field] === 1);
      });
    })
    .filter((m) => {
      if (ratingFilter === "all") return true;
      return m.rating === ratingFilter;
    }); // Sorting logic

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "titleAsc") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "titleDesc") {
      return b.title.localeCompare(a.title);
    } else {
      return 0; // ✅ No sorting — keep original DB order
    }
  }); // Pagination logic

  const totalItems = sortedMovies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageMovies = sortedMovies.slice(startIndex, endIndex);

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <AuthorizeView>
           {" "}
      <div className="bg-black text-white min-vh-100">
                <Header />
                <br />
                <br />       {" "}
        <div className="search-container">
                   {" "}
          <input
            type="text"
            placeholder="Search by Title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-bar"
          />
                    <br></br>         {" "}
          <div className="filter-sort-menu">
                        {/* Sort by Title */}           {" "}
            <select value={sortBy} onChange={handleSortChange}>
                            <option value="default">Sort</option>             {" "}
              <option value="titleAsc">Title (A-Z)</option>             {" "}
              <option value="titleDesc">Title (Z-A)</option>           {" "}
            </select>
                        {/* Media Type */}           {" "}
            <select value={mediaTypeFilter} onChange={handleMediaTypeChange}>
                            <option value="all">All Media</option>             {" "}
              <option value="movie">Movies</option>             {" "}
              <option value="tv">TV Shows</option>           {" "}
            </select>
                        {/* Filter by Rating */}           {" "}
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
                            <option value="all">All Ratings</option>           
                <option value="G">G</option>             {" "}
              <option value="PG">PG</option>             {" "}
              <option value="PG-13">PG-13</option>             {" "}
              <option value="R">R</option>             {" "}
              <option value="NC-17">NC-17</option>             {" "}
              <option value="TV-Y">TV-Y</option>             {" "}
              <option value="TV-Y7">TV-Y7</option>             {" "}
              <option value="TV-G">TV-G</option>             {" "}
              <option value="TV-PG">TV-PG</option>             {" "}
              <option value="TV-14">TV-14</option>             {" "}
              <option value="TV-MA">TV-MA</option>           {" "}
            </select>
                     {" "}
          </div>
                    {/* New Genre Carousel */}         {" "}
          <GenreCarousel
            subGenreMap={subGenreMap}
            selectedGenres={genreFilters}
            onToggleGenre={handleGenreChange}
          />
                 {" "}
        </div>
                {/* Display error message if it exists */}       {" "}
        {error && (
          <div className="text-danger px-4 py-3 text-center">
            Error: {error}
          </div>
        )}
               {" "}
        <div className="carousel-fade-in movies-grid-container">
                   {" "}
          {pageMovies.map((movie) => (
            <MovieCard key={movie.showId} movie={movie} />
          ))}
                 {" "}
        </div>
               {" "}
        <div className="pagination-controls">
                    <br></br>         {" "}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
                        Prev          {" "}
          </button>
                   {" "}
          <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                   {" "}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
                        Next          {" "}
          </button>
                    <br></br>       {" "}
        </div>
                <Footer />     {" "}
      </div>
         {" "}
    </AuthorizeView>
  );
};

export default SearchPage;
