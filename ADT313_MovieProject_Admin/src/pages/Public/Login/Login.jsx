import { useState, useRef, useCallback, useEffect, useContext } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import axios from 'axios';
import { AuthContext } from '../../../context/context'; // Corrected import

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
  const navigate = useNavigate();

  const { setAuthData, auth } = useContext(AuthContext);

  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleShowPassword = useCallback(() => {
    setIsShowPassword((value) => !value);
  }, []);

  const handleOnChange = (event, type) => {
    setDebounceState(false);
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

  const apiEndpoint = window.location.pathname.includes('/admin') ? '/admin/login' : '/user/login';

  const handleLogin = async () => {
    const data = { email, password };
    setStatus('loading');

    try {
      const res = await axios.post(apiEndpoint, data, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });

      localStorage.setItem('accessToken', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setAuthData({
        accessToken: res.data.access_token,
        user: res.data.user,
      });

      setIsError(false);
      setAlertMessage(res.data.message || 'Login successful!');
      setTimeout(() => {
        if (res.data.user.role === 'admin') {
          navigate('/main/dashboard');
        } else {
          navigate('/main');
        }
        setStatus('idle');
      }, 3000);
    } catch (e) {
      setIsError(true);
      setAlertMessage(e.response?.data?.message || e.message);
      setTimeout(() => {
        setAlertMessage('');
        setStatus('idle');
      }, 3000);
    }
  };

  // Add key down event handler to trigger login on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin(); // Call handleLogin when Enter is pressed
    }
  };

  useEffect(() => {
    setDebounceState(true);
  }, [userInputDebounce]);

  return (
    <div className="login-page">
      <div className="cineverse-title">
        <h1>CINEVERSE</h1>
      </div>
      <div className="login-container">
        {alertMessage && (
          <div className={`login-alert-box ${isError ? 'login-error' : 'login-success'}`}>
            {alertMessage}
          </div>
        )}
        <form className="login-form" onKeyDown={handleKeyDown}>
          <h1 className="login-header">Sign In</h1>
          <div className="login-form-group">
            <input
              type="text"
              placeholder="Email"
              ref={emailRef}
              onChange={(e) => handleOnChange(e, 'email')}
            />
          </div>
          {debounceState && isFieldsDirty && email === '' && (
            <span className="login-errors">This field is required</span>
          )}
          <div className="login-form-group">
            <div className="login-password-container">
              <input
                type={isShowPassword ? 'text' : 'password'}
                placeholder="Password"
                ref={passwordRef}
                onChange={(e) => handleOnChange(e, 'password')}
              />
              <span
                className="login-password-toggle"
                onClick={handleShowPassword}
              >
                <img 
                  src={isShowPassword ? '/show-pass.png' : '/hide-pass.png'} 
                  alt={isShowPassword ? '' : ''} 
                  width="25" height="25" 
                />
              </span>
            </div>
          </div>
          {debounceState && isFieldsDirty && password === '' && (
            <span className="login-errors">This field is required</span>
          )}
          <button
            type="button"
            className="login-button"
            disabled={status === 'loading'}
            onClick={handleLogin}
          >
            {status === 'idle' ? 'Sign In' : 'Loading...'}
          </button>
          <div className="login-register">
            <span>New to Cineverse? <a href="/register">Register</a></span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
