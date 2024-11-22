import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Form.css';

const Form = () => {
    const [query, setQuery] = useState('');
    const [searchedMovieList, setSearchedMovieList] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(undefined);
    const [, setMovie] = useState(undefined);
    const [notfound, setNotFound] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    let { movieId } = useParams();

    const handleSearch = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}`,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZjcwNmYyZDQwMDA0ZTUwYzhmOGUwZDg4MWNjMzMzMCIsIm5iZiI6MTczMTU5ODg1NC42MjI1ODgyLCJzdWIiOiI2NzEzMzc3MjY1MDI0OGI5ZGI2MWQ3MzgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Z5quNuFFNmtUb_Vmo7pduOIfBzu0JKfpvmmHcJJ08ps',
                },
            });

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
            backdropPath: `https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path}`,
            posterPath: `https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`,
            isFeatured: 0,
        };

        try {
            if (movieId) {
                await axios({
                    method: 'PATCH',
                    url: `/movies/${movieId}`,
                    data: data,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                alert('Update Success');
            } else {
                await axios({
                    method: 'post',
                    url: '/movies',
                    data: data,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                alert('Save Success');
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
        <div className="moviecontainer mt-5 overflow-auto movieform-container">
    <h1>{movieId ? 'Edit ' : 'Create '} Movie</h1>

    {error && <p className="text-center text-danger">{error}</p>}

    {movieId === undefined && (
        <>
            <div className="search-container">
                <div className="movieform-group">
                    <label>Search Movie: </label>
                    <div className="d-flex">
                        <input
                            type="text"
                            className="movieform-control me-2 search-input"
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setNotFound(false);
                                setSearchedMovieList([]);
                                setSelectedMovie(undefined);
                                setCurrentPage(1);
                            }}
                            placeholder="Enter movie title"
                        />
                        <button
                            type="button"
                            className="moviebtn btn-primary search-button"
                            onClick={() => handleSearch(1)}
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="searched-movie mt-3">
                    {notfound ? (
                        <p className="text-center text-white bg-danger p-2 rounded not-found-message">
                            Movie not found
                        </p>
                    ) : isLoading ? (
                        <p className="text-center">Searching...</p>
                    ) : (
                        searchedMovieList.map((movie) => (
                            <p
                                key={movie.id}
                                className="border p-2 movie-item"
                                onClick={() => handleSelectMovie(movie)}
                            >
                                {movie.original_title}
                            </p>
                        ))
                    )}
                </div>
            </div>

            {totalPages > 0 && (
                <div className="pagination-container">
                    <button
                        className="moviebtn btn-secondary prev-button"
                        onClick={() => {
                            if (currentPage > 1) {
                                handleSearch(currentPage - 1);
                                setCurrentPage(currentPage - 1);
                            }
                        }}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        className="moviebtn btn-secondary next-button"
                        onClick={() => {
                            if (currentPage < totalPages) {
                                handleSearch(currentPage + 1);
                                setCurrentPage(currentPage + 1);
                            }
                        }}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    )}

    <div className="row">
        <div className="col-md-6 poster-col">
            {selectedMovie && (
                <img
                    className="img-fluid poster-image mb-3"
                    src={`https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                />
            )}
        </div>

        <div className="col-md-6 movie-details">
            <form>
                <div className="movieform-group">
                    <label>Title</label>
                    <input
                        type="text"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.title : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, title: e.target.value })}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Overview</label>
                    <textarea
                        className="movieform-control"
                        rows={5}
                        value={selectedMovie ? selectedMovie.overview : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, overview: e.target.value })}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Popularity</label>
                    <input
                        type="number"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.popularity : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, popularity: e.target.value })}
                        step={0.1}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Release Date</label>
                    <input
                        type="date"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.release_date : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, release_date: e.target.value })}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Vote Average</label>
                    <input
                        type="number"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.vote_average : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, vote_average: e.target.value })}
                        step={0.1}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <button
                        type="button"
                        className="save-button btn-success"
                        onClick={handleSave}
                        disabled={!selectedMovie}
                    >
                        {movieId ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>


    );
};

export default Form;
