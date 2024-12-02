import { useState, useRef, useCallback, useEffect, useContext } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import axios from 'axios';
import { AuthContext } from '../../../Context/Context';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFieldsDirty, setIsFieldsDirty] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const userInputDebounce = useDebounce({ email, password }, 2000);
  const [debounceState, setDebounceState] = useState(false);
  const [status, setStatus] = useState('idle');
  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const { setAuthData, auth } = useContext(AuthContext); // Correct usage of AuthContext
  const navigate = useNavigate();

  const handleShowPassword = useCallback(() => {
    setIsShowPassword((value) => !value);
  }, []);

  const handleOnChange = (event, type) => {
    setIsFieldsDirty(true);

    switch (type) {
      case 'email':
        setEmail(event.target.value);
        break;
      case 'password':
        setPassword(event.target.value);
        break;
      default:
        break;
    }
  };

  let apiEndpoint;

  if (window.location.pathname.includes('/admin')) {
    apiEndpoint = '/admin/login';
  } else {
    apiEndpoint = '/user/login';
  }

  const handleLogin = async () => {
    const data = { email, password };
    setStatus('loading');

    try {
      const res = await axios.post(apiEndpoint, data, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });

      // Save user data and navigate based on role
      localStorage.setItem('accessToken', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setAuthData({
        accessToken: res.data.access_token,
        user: res.data.user,
      });

      setAlertMessage(res.data.message || 'Login successful!');
      setIsError(false);
      setTimeout(() => {
        navigate(res.data.user.role === 'admin' ? '/main/movies' : '/home'); // /home this user login
        setStatus('idle');
      }, 3000);
    } catch (e) {
      console.log(e);

      // Show the alert message
      setIsError(true);
      setAlertMessage(e.response?.data?.message || e.message);
      setTimeout(() => {
        setAlertMessage('');
        setStatus('idle');
      }, 3000);
    }
  };

  useEffect(() => {
    console.log('Auth State Updated:', auth);
  }, [auth]);


  useEffect(() => {
    setDebounceState(true);
  }, [userInputDebounce]);


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

 

  return (
    <div className="Login">
      <div className="main-container">
        {/* CineVerse Title */}
        <h1 className="cineverse-title">CineVerse</h1>

        <h3 className="h3-login">Login</h3>
        <form>
          <div className="form-container">
            <div>
              <div className="form-group">
                <label>E-mail:</label>
                <input
                  type="text"
                  name="email"
                  ref={emailRef}
                  onChange={(e) => handleOnChange(e, 'email')}
                  onKeyDown={handleKeyPress}
                />
              </div>
              {debounceState && isFieldsDirty && email === '' && (
                <span className="errors">This field is required</span>
              )}
            </div>
            <div>
              <div className="form-group">
                <label>Password:</label>
                <div className="password-container">
                  <input
                    type={isShowPassword ? 'text' : 'password'}
                    name="password"
                    ref={passwordRef}
                    onChange={(e) => handleOnChange(e, 'password')}
                    onKeyDown={handleKeyPress}
                  />
                  <img
                    src={isShowPassword ? '/hide-pass.png' : '/show-pass.png'}
                    alt={isShowPassword ? '' : ''}
                    className="password-icon"
                    onClick={handleShowPassword}
                  />
                </div>
              </div>
              {debounceState && isFieldsDirty && password === '' && (
                <span className='errors'>This field is required</span>
              )}
            </div>

            {/* Display Error Message */}
            {alertMessage && <div className="error-message">{alertMessage}</div>}

            <div className="submit-container">
              <button
                type="button"
                disabled={status === 'loading'}
                onClick={handleLogin}
              >
                {status === 'idle' ? 'Login' : 'Loading'}
              </button>
            </div>
            <div className="register-container">
              <p className="register-text">
                New to CineVerse? <a href="/register">Register</a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;