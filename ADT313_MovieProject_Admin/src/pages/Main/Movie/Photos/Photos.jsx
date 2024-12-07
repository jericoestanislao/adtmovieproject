import React, { useEffect, useState, useContext, useCallback, useRef } from 'react'
import { AuthContext } from "../../../../context/context";
import './Photos.css'
import axios from 'axios'
import { useParams } from 'react-router-dom';

function Photos() {
  const { auth } = useContext(AuthContext);
  const [photoid, setPhotoId] = useState(undefined);
  const urlRef = useRef();
  const descriptionRef = useRef();
  const [photos, setPhotos] = useState([]);
  const [selectedphoto, setSelectedPhoto] = useState({});
  let { movieId } = useParams();

  function importDataPhoto() {
    axios({
      method: 'get',
      url: `https://api.themoviedb.org/3/movie/${movieId}/images`,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MGY0ZjFlMmNhODQ1ZjA3NWY5MmI5ZDRlMGY3ZTEwYiIsIm5iZiI6MTcyOTkyNjY3NC40NzIwOTksInN1YiI6IjY3MTM3ODRmNjUwMjQ4YjlkYjYxZTgxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RRJNLOg8pmgYoomiCWKtwkw74T3ZtAs7ZScqxo1bzWg', // Make sure to replace this with your actual API key
      },
    }).then((response) => {
      setSavePhotosImp(response.data.backdrops);
      alert(`Total of ${response.data.backdrops.length} Photos are now Imported to Database`);
      setTimeout(() => {
        getAll(movieId);
      }, 2000);
    })
  }

  //Saving all Photo Imported to Database
  async function setSavePhotosImp(photoImportData) {
    await Promise.all(photoImportData.map(async (datainfo) => {
      const dataphoto = {
        userId: auth.user.userId,
        movieId: movieId,
        description: `Imported from TMDB Data`,
        url: `https://image.tmdb.org/t/p/w500/${datainfo.file_path}`,
      };
      console.log('Transfering import to Database', dataphoto);
      try {
        await axios.post('/admin/photos', dataphoto, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
      } catch (error) {
        console.error('Error of Importing:', error);
      }
    }));
    console.log('Imported Success');
  }

  // Fetch all photos
  const getAll = useCallback((movieId) => {
    axios({
      method: 'get',
      url: `/movies/${movieId}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        console.log("Fetched Photos:", response.data.photos); // Debugging log
        setPhotos(response.data.photos || []);
      })
      .catch((error) => {
        console.error("Error fetching Photos:", error.response?.data || error.message);
      });
  }, [auth.accessToken]);

  // Run getAll on component mount
  useEffect(() => {
    if (movieId) getAll(movieId);
  }, [movieId, getAll]);

  // Validate input fields
  const validateField = (fieldRef, fieldName) => {
    if (!fieldRef.current.value.trim()) {
      fieldRef.current.style.border = '2px solid red';
      setTimeout(() => {
        fieldRef.current.style.border = '1px solid #ccc';
      }, 2000);
      console.log(`${fieldName} cannot be empty.`);
      return false;
    }
    return true;
  };

  // Save new photo
  const handlesave = async () => {
    const validateFields = () => {
      const isUrlValid = validateField(urlRef, "URL");
      const isDescriptionValid = validateField(descriptionRef, "Description");
      return isUrlValid && isDescriptionValid;
    };

    if (!validateFields()) return;

    try {
      const dataphoto = {
        userId: auth.user.userId,
        movieId: movieId,
        url: selectedphoto.url,
        description: selectedphoto.description,
      };
      console.log("Saving Photo:", dataphoto);

      await axios({
        method: 'POST',
        url: '/admin/photos',
        data: dataphoto,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      alert('Photo added successfully!');
      setSelectedPhoto({});
      getAll(movieId);
    } catch (error) {
      console.error("Error Saving Photo:", error.response?.data || error.message);
    }
  };

  // Delete photo
  const handledelete = (id) => {
    if (window.confirm("Are you sure to delete this photo?")) {
      axios({
        method: 'delete',
        url: `/photos/${id}`,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      })
        .then(() => {
          alert("Photo deleted successfully!");
          getAll(movieId);
        })
        .catch((error) => {
          console.error("Error Deleting Photo:", error.response?.data || error.message);
        });
    }
  };

  // Clear selected photo
  const handleclear = useCallback(() => {
    setSelectedPhoto({});
    setPhotoId(undefined);
  }, []);

  // Fetch a single photo for editing
  const photofetch = async (id) => {
    try {
      const response = await axios({
        method: 'get',
        url: `/photos/${id}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      console.log("Fetched Photo for Editing:", response.data);
      setSelectedPhoto(response.data);
      setPhotoId(response.data.id);
    } catch (error) {
      console.error("Error Fetching Photo:", error.response?.data || error.message);
    }
  };

  // Update a photo
  const photoUpdate = async (id) => {
    const validateFields = () => {
      const isUrlValid = validateField(urlRef, "URL");
      const isDescriptionValid = validateField(descriptionRef, "Description");
      return isUrlValid && isDescriptionValid;
    };

    if (!validateFields()) return;

    if (window.confirm("Are you sure you want to update this photo?")) {
      const dataphoto = {
        userId: auth.user.userId,
        movieId: selectedphoto.movieId,
        description: selectedphoto.description,
        url: selectedphoto.url,
      };
      console.log("Updating Photo:", dataphoto);

      try {
        await axios({
          method: 'patch',
          url: `/photos/${id}`,
          data: dataphoto,
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        alert('Photo updated successfully!');
        handleclear();
        getAll(movieId);
      } catch (error) {
        console.error("Error Updating Photo:", error.response?.data || error.message);
      }
    }
  };

  return (
    <div className='photos-page-box'>
      <div className='photos-view-container'>
        {photos.length > 0 ? (
          <div className='photos-grid'>
            {photos.map((image) => (
              <div key={image.id} className='photo-card'>
                <div className='photo-buttons'>
                  <button
                    type='button'
                    className='delete-photo-btn'
                    onClick={() => handledelete(image.id)}
                  >
                    Delete
                  </button>
                  <button
                    type='button'
                    className='edit-photo-btn'
                    onClick={() => photofetch(image.id)}
                  >
                    Edit
                  </button>
                </div>
                <img
                  src={image.url || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'}
                  alt={image.description || 'No description available'}
                  className='photo-thumbnail'
                />
                <div className='photo-description-container'>
                  <p>{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='no-photos-message'>
            <h3>No Photos Found</h3>
          </div>
        )}
      </div>
      <div className='photo-search-container'>
        <div className='photo-details-wrapper'>
          <div className='photo-image-wrapper'>
            <img
              alt='Selected'
              src={selectedphoto.url || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'}
              className='selected-photo-img'
            />
          </div>
          <div className='photo-input-group'>
            <label className='input-label'>Url Image:</label>
            <input
              className='photo-url-input'
              value={selectedphoto.url || ''}
              onChange={(e) => setSelectedPhoto({ ...selectedphoto, url: e.target.value })}
              ref={urlRef}
            />
          </div>
          <div className='photo-input-group'>
            <label className='input-label'>Description:</label>
            <textarea
              className='photo-description-textarea'
              value={selectedphoto.description || ''}
              onChange={(e) => setSelectedPhoto({ ...selectedphoto, description: e.target.value })}
              ref={descriptionRef}
            />
          </div>
        </div>
        <div className='action-buttons-container'>
          {!photoid ? (
            <button className='save-photo-btn' type='button' onClick={handlesave}>Save</button>
          ) : (
            <button className='update-photo-btn' type='button' onClick={() => photoUpdate(photoid)}>Update</button>
          )}
          <button className='clear-photo-btn' type='button' onClick={handleclear}>Clear</button>
        </div>
      </div>
    </div>
  );
}

export default Photos;
