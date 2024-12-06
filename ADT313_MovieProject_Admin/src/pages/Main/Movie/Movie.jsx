import { Outlet } from 'react-router-dom';
import './Movie.css';

const Movie = () => {
  return (
    <div className="movie-page">  
      <h1>Movie Page</h1>
      <div className="lists-container">
        <div className="table-container">
          <table className="movie-lists">
          </table>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Movie;
