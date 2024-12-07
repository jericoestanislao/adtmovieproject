import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Form.css';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../../../context/context'; // Corrected import


const Form = () => {
  const { auth } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [searchedMovieList, setSearchedMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(undefined);
  const [movie, setMovie] = useState(undefined);
  const [notFound, setNotFound] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { movieId } = useParams();

  const API_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_HEADERS = {
    Accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NDg4ZjliMzBlZTZjYTlmODVkNzNmMDZhMTcxY2FlNyIsIm5iZiI6MTczMjU5NjE4NC4yOTc5OTk5LCJzdWIiOiI2NzQ1NTFkOGRjYmIxNWM4OWE4YjQ5OTMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.JlOUhYgfze6MaoOIqv-sXDywzFDPs7I_lmgD1pT5Ig0',
  };

  const generateImageUrl = (path) => {
    return path ? `https://image.tmdb.org/t/p/original/${path}` : '';
  };

  const handleSearch = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}`,
        { headers: TMDB_HEADERS }
      );

      if (response.data.results.length === 0) {
        setNotFound(true);
        setSearchedMovieList([]);
        setTotalPages(0);
      } else {
        setSearchedMovieList(response.data.results);
        setTotalPages(response.data.total_pages);
        setNotFound(false);
      }
    } catch (err) {
      setError('Error fetching movies. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!selectedMovie) {
      alert('Please search and select a movie.');
      return;
    }

    const data = {
      tmdbId: selectedMovie.id,
      title: selectedMovie.title,
      overview: selectedMovie.overview,
      popularity: selectedMovie.popularity,
      releaseDate: selectedMovie.release_date,
      voteAverage: selectedMovie.vote_average,
      backdropPath: generateImageUrl(selectedMovie.backdrop_path),
      posterPath: generateImageUrl(selectedMovie.poster_path),
      isFeatured: 0,
    };

    try {
      if (movieId) {
        await axios.patch(`/movies/${movieId}`, data, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        alert('Movie updated successfully.');
      } else {
        await axios.post('/movies', data, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        alert('Movie created successfully.');
      }
      navigate('/main/movies');
    } catch (err) {
      setError('Error saving movie. Please try again later.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (movieId) {
      const fetchMovie = async () => {
        try {
          const response = await axios.get(`/movies/${movieId}`);
          setMovie(response.data);
          setSelectedMovie({
            id: response.data.tmdbId,
            title: response.data.title,
            overview: response.data.overview,
            popularity: response.data.popularity,
            poster_path: response.data.posterPath,
            release_date: response.data.releaseDate,
            vote_average: response.data.voteAverage,
          });
        } catch (err) {
          setError('Error fetching movie details. Please try again later.');
          console.error(err);
        }
      };

      fetchMovie();
    }
  }, [movieId]);

  return (
    <div className="container1">
      <h1>{movieId ? 'Edit Movie' : 'Create Movie'}</h1>

      {error && <p className="text-danger text-center">{error}</p>}

      {!movieId && (
        <>
          <div className="search-container">
            <label>Search Movie:</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter movie title"
            />
            <button onClick={() => handleSearch(1)}>Search</button>
          </div>

          <div className="searched-movie">
            {isLoading ? (
              <p>Loading...</p>
            ) : notFound ? (
              <p>No movies found.</p>
            ) : (
              searchedMovieList.map((movie) => (
                <p key={movie.id} onClick={() => handleSelectMovie(movie)}>
                  {movie.title}
                </p>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => prev - 1);
                  handleSearch(currentPage - 1);
                }}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => prev + 1);
                  handleSearch(currentPage + 1);
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="movie-details">
        <form>
          {selectedMovie?.poster_path && (
            <img
              src={generateImageUrl(selectedMovie.poster_path)}
              alt={selectedMovie.title}
              className="poster-image"
            />
          )}

          <label>Title</label>
          <input
            type="text"
            value={selectedMovie?.title || ''}
            onChange={(e) => setSelectedMovie({ ...selectedMovie, title: e.target.value })}
          />

          <label>Overview</label>
          <textarea
            rows="5"
            value={selectedMovie?.overview || ''}
            onChange={(e) => setSelectedMovie({ ...selectedMovie, overview: e.target.value })}
          ></textarea>

          <label>Popularity</label>
          <input
            type="number"
            value={selectedMovie?.popularity || ''}
            onChange={(e) => setSelectedMovie({ ...selectedMovie, popularity: e.target.value })}
          />

          <label>Release Date</label>
          <input
            type="date"
            value={selectedMovie?.release_date || ''}
            onChange={(e) => setSelectedMovie({ ...selectedMovie, release_date: e.target.value })}
          />

          <label>Vote Average</label>
          <input
            type="number"
            value={selectedMovie?.vote_average || ''}
            onChange={(e) => setSelectedMovie({ ...selectedMovie, vote_average: e.target.value })}
          />

          <button type="button" onClick={handleSave}>
            {movieId ? 'Update' : 'Save'}
          </button>
        </form>
      </div>

      {movieId && (
        <div>
          <hr />
          <nav>
            <ul className="tabs">
              <li
                onClick={() => {
                  navigate(`/main/movies/form/${movieId}/CastandCrews`);
                }}
              >
                Cast & Crews
              </li>
              <li
                onClick={() => {
                  navigate(`/main/movies/form/${movieId}/videos`);
                }}
              >
                Videos
              </li>
              <li
                onClick={() => {
                  navigate(`/main/movies/form/${movieId}/photos`);
                }}
              >
                Photos
              </li>
            </ul>
          </nav>

          <Outlet />
        </div>
      )}
    </div>
  );
};

export default Form;