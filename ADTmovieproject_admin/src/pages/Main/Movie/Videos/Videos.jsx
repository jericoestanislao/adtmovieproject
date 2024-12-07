import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../../../../context/context';
import axios from 'axios'
import { useParams } from 'react-router-dom';
import './Videos.css'

function Videos() {
  const { auth } = useContext(AuthContext);
  const [videoId, setVideoId] = useState(undefined);
  const [videoURL, setVideoURL] = useState('');
  const [videos, setVideos] = useState([]);
  const [videokey, setVideoKey] = useState({})
  const [selectedvideo, setSelectedVideo] = useState({});
  const urlRef = useRef();
  const nameRef = useRef();
  const siteRef = useRef();
  const videoTypeRef = useRef();
  let { movieId } = useParams();

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
        setVideos(response.data.videos);
      })
      .catch((error) => {
        console.error("Error fetching Videos:", error.response.data);
      });
  }, [auth.accessToken])

  const getYouTubeVideoID = (url) => {
    if (!url || typeof url !== 'string') {
      console.log("Invalid URL:", url);
      setVideoKey('');
      return null;
    }

    const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/)([\w-]+))/i;
    const match = url.match(regex);
    console.log("URL:", url);
    console.log("Match:", match);

    if (match && match[1]) {
      setVideoKey(match[1]);
      return match[1];
    } else {
      setVideoKey('');
      return null;
    }
  };

  const validateField = (fieldRef, fieldName) => {
    if (!fieldRef.current) {
      console.error(`Field ${fieldName} ref is not assigned.`);
      return false;
    }

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

  //This used for Importing Videos based on tmdbId from Movie
  function importDataVideo() {
    axios({
      method: 'get',
      url: `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MGY0ZjFlMmNhODQ1ZjA3NWY5MmI5ZDRlMGY3ZTEwYiIsIm5iZiI6MTcyOTkyNjY3NC40NzIwOTksInN1YiI6IjY3MTM3ODRmNjUwMjQ4YjlkYjYxZTgxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RRJNLOg8pmgYoomiCWKtwkw74T3ZtAs7ZScqxo1bzWg', // Make sure to replace this with your actual API key
      },
    }).then((response) => {
      setSavePhotosImp(response.data.results);
      alert(`Total of ${response.data.results.length} Videos are now Imported to Database`);
      setTimeout(() => {
        getAll(movieId);
      }, 2000);
    })
  }

  //Saving all Video Imported to Database
  async function setSavePhotosImp(vidoeImportData) {
    await Promise.all(vidoeImportData.map(async (datainfo) => {
      const datavideo = {
        userId: auth.user.userId,
        movieId: movieId,
        url: `https://www.youtube.com/embed/${datainfo.key}`,
        videoKey: datainfo.key,
        name: datainfo.name,
        site: datainfo.site,
        videoType: datainfo.type,
        official: datainfo.official,
      };
      console.log('Transfering import to Database', datavideo);
      try {
        await axios.post('/admin/videos', datavideo, {
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

  const handlesave = async () => {
    const dataphoto = {
      userId: auth.user.userId,
      movieId: movieId,
      url: `https://www.youtube.com/embed/${videokey}`,
      videoKey: videokey,
      name: selectedvideo.name,
      site: selectedvideo.site,
      videoType: selectedvideo.videoType,
      official: selectedvideo.official,
    }
    console.table(dataphoto)
    const validateFields = () => {
      const isUrlValid = validateField(urlRef, "YouTube Link");

      if (isUrlValid) {
        const videoKey = getYouTubeVideoID(urlRef.current.value);
        if (!videoKey) {
          urlRef.current.style.border = '2px solid red';
          setTimeout(() => {
            urlRef.current.style.border = '1px solid #ccc';
          }, 2000);
          console.log("Invalid YouTube link. Please enter a valid URL.");
          alert("Invalid YouTube link. Please enter a valid URL.")
          return false;
        }
      }

      const isNameValid = validateField(nameRef, "Title Name");
      const isSiteValid = validateField(siteRef, "Site Type");
      const isVideoTypeValid = validateField(videoTypeRef, "Video Type");

      return isUrlValid && isNameValid && isSiteValid && isVideoTypeValid;
    };


    if (!validateFields()) {
      return; // This is for stop if any valid is null
    } else {
      try {
        const dataphoto = {
          userId: auth.user.id,
          movieId: movieId,
          url: `https://www.youtube.com/embed/${videokey}`,
          videoKey: videokey,
          name: selectedvideo.name,
          site: selectedvideo.site,
          videoType: selectedvideo.videoType,
          official: selectedvideo.official,
        }
        await axios({
          method: 'POST',
          url: '/admin/videos',
          data: dataphoto,
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          }
        });
        alert('Added Success');
        getAll(movieId);
        setSelectedVideo([]);
        setVideoURL('')
        setVideoKey('')
        getYouTubeVideoID(null);
        urlRef.current.value = '';
      } catch (error) {
        console.log("Error Saving Video", error.response?.data || error.message);
        alert(`Incorrect Link or Error: ${error.message}`)
      }
    }
  };

  useEffect(() => {
    getAll(movieId);
  }, [movieId, getAll]);

  const handledelete = async (id) => {
    const isConfirm = window.confirm("Are you sure you want to delete this Video?");

    if (isConfirm) {
      try {
        const response = await axios({
          method: 'delete',
          url: `/videos/${id}`,
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        alert("Delete successful!");
        console.log(response);
        getAll(movieId);
      } catch (err) {
        console.error("Error deleting video:", err.message);
        alert("An error occurred while deleting the video.");
      }
    }
  };

  const videoget = async (id) => {
    axios({
      method: 'get',
      url: `/videos/${id}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then((response) => {
        setSelectedVideo(response.data);
        setVideoId(response.data.id)
      })
      .catch((error) => {
        console.log(error)
      });
  }

  const handleclear = useCallback(() => {
    setSelectedVideo([]);
    setVideoId(undefined);
    setVideoKey('');
    setVideoURL('');
    urlRef.current.value = '';
  }, [setSelectedVideo, setVideoId, setVideoKey, setVideoURL]);

  const videoUpdate = async (id) => {

    const validateFields = () => {
      const isUrlValid = validateField(urlRef, "YouTube Link");

      if (isUrlValid) {
        const videoKey = getYouTubeVideoID(urlRef.current.value);
        if (!videoKey) {
          urlRef.current.style.border = '2px solid red';
          setTimeout(() => {
            urlRef.current.style.border = '1px solid #ccc';
          }, 2000);
          console.log("Invalid YouTube link. Please enter a valid URL.");
          alert("Invalid YouTube link. Please enter a valid URL.")
          return false;
        }
      }

      const isNameValid = validateField(nameRef, "Title Name");
      const isSiteValid = validateField(siteRef, "Site Type");
      const isVideoTypeValid = validateField(videoTypeRef, "Video Type");

      return isUrlValid && isNameValid && isSiteValid && isVideoTypeValid;
    };

    if (!validateFields()) {
      return; // This is for stop if any valid is null
    } else {
      const isConfirm = window.confirm("Are you sure you want to update the Video?");
      if (isConfirm) {
        const data = {
          ...(videokey
            ? {
              url: `https://www.youtube.com/embed/${videokey}`,
              videoKey: videokey,
            }
            : {
              url: selectedvideo.url,
              videoKey: selectedvideo.videoKey,
            }),
          name: selectedvideo.name,
          site: selectedvideo.site,
          videoType: selectedvideo.videoType,
          official: selectedvideo.official,
        };
        try {
          const response = await axios({
            method: 'patch',
            url: `/videos/${id}`,
            data: data,
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          alert('Updated Successfully');
          console.log(response.message);
          handleclear();
          getAll(movieId)
        } catch (error) {
          console.error("Error updating cast:", error.response?.data || error.message);
        }
      }
    }
  }

  return (
    <div className='video-box'>
      <div className='Video-View-Box'>
        {videos !== undefined && videos.length > 0 ? (
          <div className='card-display-videos'>
            {videos.map((items) => (
              <div key={items.id} className='card-video'>
                <div className='buttons-group'>
                  <button
                    type='button'
                    className='delete-button'
                    onClick={() => handledelete(items.id)}
                  >
                    
                  </button>
                  <button
                    type='button'
                    className='edit-button'
                    onClick={() => videoget(items.id)}
                  >
                    
                  </button>
                </div>
                <iframe
                  className='video-style'
                  width="100%"
                  src={`https://www.youtube.com/embed/${items.videoKey}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title='display-video-view'
                ></iframe>
                <div className='container-video'>
                  <p>{items.name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='no-videos'>
            <h3>Videos not Found</h3>
          </div>
        )}
      </div>
      <div className='Video-Search-Box'>
        <div className='parent-container'>
          <div className='video-detail-box'>
            <div className='video-container-center'>
              <div className='video-frame-container'>
                <iframe
                  title='display-video-save'
                  className='video-frame'
                  src={
                    selectedvideo.url
                      ? selectedvideo.url
                      : videokey
                        ? `https://www.youtube.com/embed/${videokey}`
                        : "https://www.youtube.com/embed/invalid"
                  }
                  frameBorder="0"
                >
                </iframe>
              </div>
            </div>
          </div>
          <div className='video-info-text'>
            <div className='input-group'>
              <label className='label-video'>
                Video Url:
              </label>
              <input
                type="url"
                className="video-url"
                value={videoURL || selectedvideo.url}
                onChange={(e) => {
                  const value = e.target.value;
                  setVideoURL(value);
                  const videoKey = getYouTubeVideoID(value);
                  if (videoKey) {
                    setSelectedVideo((prev) => ({ ...prev, url: `https://www.youtube.com/embed/${videoKey}` }));
                  } else {
                    setSelectedVideo((prev) => ({ ...prev, url: '' }));
                  }
                }}
                ref={urlRef}
              />
            </div>
            <div className='input-group'>
              <label className='label-video'>
                Name Video:
              </label>
              <input
                type='text'
                className='video-name'
                maxLength={100}
                value={selectedvideo.name || ''}
                onChange={(e) => setSelectedVideo({ ...selectedvideo, name: e.target.value })}
                ref={nameRef}
              />
            </div>
            <div className='input-group'>
              <label className='label-video'>
                Site:
              </label>
              <input
                type='text'
                className='site-name'
                value={selectedvideo.site || ''}
                maxLength={20}
                onChange={(e) => setSelectedVideo({ ...selectedvideo, site: e.target.value })}
                ref={siteRef}
              />
            </div>
            <div className='input-group'>
              <label className='label-video'>
                Video Type:
              </label>
              <input
                type='text'
                className='video-type-name'
                maxLength={20}
                value={selectedvideo.videoType || ''}
                onChange={(e) => setSelectedVideo({ ...selectedvideo, videoType: e.target.value })}
                ref={videoTypeRef}
              />
            </div>
            <div className='input-group'>
              <label className='label-video'>
                Official:
              </label>
              <select
                className='seletor-official'
                value={
                  selectedvideo && selectedvideo.official !== undefined
                    ? (selectedvideo.official ? 'Yes' : 'No')
                    : ''
                }
                onChange={(e) =>
                  setSelectedVideo({
                    ...selectedvideo,
                    official: e.target.value === 'Yes',
                  })
                }
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>

            </div>
          </div>
          <div className='save-edit-back-btn'>
            {!videoId ? (
              <>
                <button className='edit-save-btn'
                  type='button'
                  onClick={handlesave}
                >
                  Save
                </button>
                
              </>
            ) : (
              <>
                <button className='edit-save-btn'
                  type='button'
                  onClick={() => videoUpdate(videoId)}
                >
                  Update
                </button>
              </>
            )}

            <button className='clear-btn'
              type='button'
              onClick={handleclear}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Videos