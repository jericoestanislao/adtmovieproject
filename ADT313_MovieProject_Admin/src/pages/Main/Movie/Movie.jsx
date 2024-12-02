import { Outlet } from 'react-router-dom';
import './Movie.css'; // Import the CSS file

const Movie = () => {
  return (
    <div className="movie-container">
      <h1>Movie Page</h1>
      <Outlet />
    </div>
  );
};

export default Movie;
