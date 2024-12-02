import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../../../../../src/Context/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './Cast.css';
import { useParams } from 'react-router-dom';

function Casts() {
  const { auth } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [cast, setCast] = useState([]);
  const [castid, setCastId] = useState(undefined);
  const [selectedcast, setSelectedCast] = useState({})
  const searchRef = useRef();
  const [notfound, setNotFound] = useState(false);
  const nameRef = useRef();
  const characterNameRef = useRef()
  const urlRef = useRef();
  let { movieId } = useParams();

  const getAll = useCallback((movie_id) => {
    axios({
      method: 'get',
      url: `/movies/${movie_id}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        setCast(response.data.casts);
      })
      .catch((error) => {
        console.error("Error fetching Casts:", error.response.data);
      });
  }, [auth.accessToken]) // Add `auth.accessToken` as a dependency

  useEffect(() => {
    getAll(movieId);
  }, [movieId, getAll]); // Add `getAll` to the dependency array

  const handleSearchPerson = useCallback(async (page = 1) => {
    setNotFound(true);
    try {
      if (!query || query.trim() === '') {
        searchRef.current.style.border = '2px solid red';
        console.log("Input is empty or undefined");
        setTimeout(() => {
          searchRef.current.style.border = '1px solid #ccc';
          setNotFound(false);
        }, 2000);
        return;
      }
      const response = await axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=${page}`,
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MGY0ZjFlMmNhODQ1ZjA3NWY5MmI5ZDRlMGY3ZTEwYiIsIm5iZiI6MTcyOTkyNjY3NC40NzIwOTksInN1YiI6IjY3MTM3ODRmNjUwMjQ4YjlkYjYxZTgxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RRJNLOg8pmgYoomiCWKtwkw74T3ZtAs7ZScqxo1bzWg'
        },
      });

      if (response.data.results.lenght === 0) {
        console.log("Not Found");
        setSelectedCast([])
      } else {
        setNotFound(false);
        setSelectedCast(response.data.results[0]);
        console.log(response.data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }, [query])

  const handlesave = async () => {
    if (!characterNameRef.current.value.trim()) {
      characterNameRef.current.style.border = '2px solid red';
      setTimeout(() => {
        characterNameRef.current.style.border = '1px solid #ccc';
      }, 2000);
      return;
    }
    try {
      const datacast = {
        userId: auth.user.userId,
        movieId: movieId,
        name: selectedcast.name,
        url: `https://image.tmdb.org/t/p/original/${selectedcast.profile_path}`,
        characterName: selectedcast.characterName,
      }
      await axios({
        method: 'POST',
        url: '/admin/casts',
        data: datacast,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        }
      });

      alert('Added Success');
      setSelectedCast({});
      handleClearInput();
      getAll(movieId);
    } catch (error) {
      alert("Nothing to Save. Data is Empty...")
      console.log(error);
    }
  }

  const castget = async (id) => {
    axios({
      method: 'get',
      url: `/casts/${id}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        setSelectedCast(response.data);
        setCastId(response.data.id)
      })
      .catch((error) => {
        console.log(error)
      });
  }

  const validateField = (fieldRef, fieldName) => {
    if (!fieldRef.current.value.trim()) {
      fieldRef.current.style.border = '2px solid red';
      setTimeout(() => {
        fieldRef.current.style.border = '1px solid #ccc';
      }, 2000);
      console.log(`${fieldName} cannot be empty.`)
      return false;
    }
    return true;
  };

  const castupdate = async (id) => {
    if (!selectedcast?.id) {
      alert("No cast selected to update.");
      return;
    }

    const validateFields = () => {
      switch (true) {
        case !validateField(nameRef, "Name"):
          return false;
        case !validateField(characterNameRef, "Character Name"):
          return false;
        case !validateField(urlRef, "URL"):
          return false;
        default:
          return true;
      }
    };

    if (!validateFields()) {
      return; // This is for stop if any valid is null
    } else {
      const isConfirm = window.confirm("Are you sure you want to update the cast?");
      if (isConfirm) {
        const datacast = {
          id: selectedcast.id,
          userId: selectedcast.userId,
          name: selectedcast.name,
          url: selectedcast.url,
          characterName: selectedcast.characterName,
        };

        console.table(datacast);
        try {
          const response = await axios({
            method: 'patch',
            url: `/casts/${id}`,
            data: datacast,
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          alert('updated Successfully!');
          console.log(response.message);
          handleclear();
          getAll(movieId)
        } catch (error) {
          console.error("Error updating cast:", error.response?.data || error.message);
        }
      }
    }
  };

  const handleclear = useCallback(() => {
    setSelectedCast([]);
    setCastId(undefined);
  }, [setSelectedCast, setCastId]);

  const handleClearInput = () => {
    setQuery("");
    setSelectedCast({});
  };

  const handledelete = (id) => {
    const isConfirm = window.confirm("Are you Sure to Delete Cast?");

    if (isConfirm) {
      axios({
        method: 'delete',
        url: `/admin/casts/${id}`,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      })
        .then(() => {
          console.log("Database Updated");
        })
        .catch((error) => {
          console.error(error);
          getAll(movieId);
          alert("Delete Success!");
        });
    }
  };

  return (
    <div className='cast-box'>
      <div className='Cast-View-Box'>
        {cast !== undefined && cast.length > 0 ? (
          <div className='card-display-cast'>
            <div className="card-wrapper">
              {cast.map((actor) => (
                <div key={actor.id} className="card">
                  <div className='buttons-group'>
                    <button
                      type='button'
                      className='delete-button'
                      onClick={() => handledelete(actor.id)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                    <button
                      type='button'
                      className='edit-button'
                      onClick={() => castget(actor.id)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                  <img src={actor.url} alt={actor.name} style={{ width: 'auto' }} className='image-casts' />
                  <div className="container">
                    <h4><b>{actor.name}</b></h4>
                    <p>{actor.characterName}</p>
                    <div className="button-group">
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='no-cast'>
            <h3>Cast not Found</h3>
          </div>
        )}
      </div>
      <div className='Search-Box'>
        <div className='parent-container'>
          {castid === undefined && (
            <>
              <div className='search-box-btn'>
                <input
                  className='input-search-person'
                  type='text'
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedCast({})
                  }}
                  placeholder='search cast name'
                  ref={searchRef}
                />
                <button
                  className='button-search'
                  type='button'
                  onClick={() => handleSearchPerson(1)}
                  disabled={notfound}
                >
                  {notfound ? 'Searching...' : 'Search'}
                </button>
                <button
                  className='save-button'
                  type='button'
                  onClick={handlesave}
                  disabled={!selectedcast}
                >
                  Add Cast
                </button>
              </div>
            </>
          )}
          <div className='cast-detail-box'>
            <div className='image-container-center'>
              <div className='image-container'>
                <img
                  alt='image-cast'
                  src={selectedcast?.profile_path
                    ? `https://image.tmdb.org/t/p/original/${selectedcast.profile_path}`
                    : selectedcast?.url

                  }
                  className='img-cast'
                />
              </div>
            </div>

            <div className='info-text'>
              <div className='input-group'>
                <label className='cast-n'>
                  Cast Name:
                </label>
                <input className='cast-name'
                  value={selectedcast.name || ''}
                  onChange={
                    (e) => setSelectedCast({ ...selectedcast, name: e.target.value })}
                  disabled={castid === undefined}
                  ref={nameRef}
                />
              </div>
              <div className='input-group'>
                <label className='character-n'>
                  Character Name:
                </label>
                <input
                  className='character-name'
                  value={selectedcast.characterName || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, characterName: e.target.value })}
                  ref={characterNameRef}
                />
              </div>
              <div className='input-group'>
                <label className='url-text'>
                  Url:
                </label>
                <input className='url-text-photo'
                  value={selectedcast.profile_path || '' || selectedcast.url || ''}
                  onChange={(e) => setSelectedCast({ ...selectedcast, url: e.target.value })}
                  disabled={castid === undefined}
                  ref={urlRef}
                />
              </div>
            </div>
            {castid !== undefined && (
              <>
                <div className='edit-back-btn'>
                  <button className='edit-btn'
                    type='button'
                    onClick={() => castupdate(selectedcast.id)}
                  >
                    Update
                  </button>
                  <button className='back-btn'
                    type='button'
                    onClick={handleclear}
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Casts;