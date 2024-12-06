import { useState, useRef, useCallback, useEffect } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNo, setcontactNo] = useState('');
  const [role, setRole] = useState('');
  const [isFieldsDirty, setIsFieldsDirty] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const contactNoRef = useRef();
  const roleRef = useRef();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const userInputDebounce = useDebounce({ email, password, firstName, middleName, lastName, contactNo, role }, 2000);
  const [debounceState, setDebounceState] = useState(false);
  const [status, setStatus] = useState('idle');


  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);


  const navigate = useNavigate();

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
      
      case 'firstName':
        setFirstName(event.target.value);
        break;

      case 'middleName':
        setMiddleName(event.target.value);
        break;

      case 'lastName':
        setLastName(event.target.value);
        break;


      case 'contactNo':
        setcontactNo(event.target.value);
        break;

      case 'role':
        setRole(event.target.value);
        break;

      default:
        break;
    }
  };

  let apiEndpoint;

  if (window.location.pathname.includes('/admin')) {
    apiEndpoint = '/admin/register';
  } else {
    apiEndpoint = '/user/register';
  }

  const handleRegister = async () => {
    const data = { email, password, firstName, middleName, lastName, contactNo, role };
    setStatus('loading');
    console.log(data);

    await axios({
      method: 'post',
      url: apiEndpoint,
      data,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
      .then((res) => {
        console.log(res);
        localStorage.setItem('accessToken', res.data.access_token);

        //show the alert message
        setIsError(false);
        setAlertMessage(res.data.message);
        setTimeout(() => {
          navigate('/');
          setStatus('idle');
        }, 3000);
      })
      .catch((e) => {
        console.log(e);
        setStatus('idle');

        //show the alert message
        setIsError(true);
        setAlertMessage(e.response?.data?.message || e.message);
        setTimeout(() => setAlertMessage(''), 3000);

        //alert(e.response.data.message);
      });
  };

  useEffect(() => {
    setDebounceState(true);
  }, [userInputDebounce]);

  return (
    <div className='Register'>
      <div className='main-container'>
        {alertMessage && (<div className={`alert-box ${isError ? 'error' : 'success'}`}>{alertMessage}</div>)}
        <form>
          <div className='form-container'>
            <div className='register-header'>
            <h1>Register</h1>
            </div>
            <div>

              <div>
                <div className='form-group'>
                  <label>First Name:</label>
                  <input type='text' name='firstName' ref={firstNameRef} onChange={(e) => handleOnChange(e, 'firstName')} required/>
                </div>
                {debounceState && isFieldsDirty && firstName === '' && (
                  <span className='errors'>This field is required</span>
                )}
              </div>

              <div>
                <div className='form-group'>
                  <label>Middle Name:</label>
                  <input type='text' name='middleName' ref={middleNameRef} onChange={(e) => handleOnChange(e, 'middleName')} required/>
                </div>
                {debounceState && isFieldsDirty && middleName === '' && (
                  <span className='errors'>This field is required</span>
                )}
              </div>

              <div>
                <div className='form-group'>
                  <label>Last Name:</label>
                  <input type='text' name='lastName' ref={lastNameRef} onChange={(e) => handleOnChange(e, 'lastName')} required/>
                </div>
                {debounceState && isFieldsDirty && lastName === '' && (
                  <span className='errors'>This field is required</span>
                )}
              </div>

                <div>
                  <div className='form-group'>
                    <label>Contact Number:</label>
                    <input type='text' name='contactNo' ref={contactNoRef} onChange={(e) => handleOnChange(e, 'contactNo')} required/>
                  </div>
                  {debounceState && isFieldsDirty && contactNo === '' && (
                    <span className='errors'>This field is required</span>
                  )}
                </div>

              <div>
                <div className='form-group'>
                  <label>Email:</label>
                  <input type='text' name='email' ref={emailRef} onChange={(e) => handleOnChange(e, 'email')} required/>
                  </div>
                  {debounceState && isFieldsDirty && email === '' && (
                    <span className='errors'>This field is required</span>
                  )}
                </div>
                <div>
                  <div className='form-group'>
                    <label>Password:</label>
                    <div>
                      <input type={isShowPassword ? 'text' : 'password'} name='password' ref={passwordRef} onChange={(e) => handleOnChange(e, 'password')} />
                      <span className={`fas ${isShowPassword ? '/public/show-pass.png' : '/public/hide-pass.png'}` } id='icon-toggle' onClick={handleShowPassword} />
                    </div>
                  </div>
                  {debounceState && isFieldsDirty && password === '' && (
                    <span className='errors'>This field is required</span>
                  )}
                </div>
              </div>

              <div className='submit-container'>
                <button
                  type='button'
                  className='register-btn'
                  disabled={status === 'loading'}
                  onClick={() => {
                    if (status === 'loading') {
                      return;
                    }
                    if (email && password && firstName && middleName && contactNo) {
                      handleRegister({
                        type: 'register',
                        user: { email, password, firstName,middleName,lastName,contactNo,role },
                      });
                    } else {
                      setIsFieldsDirty(true);
                      if (email === '') {
                        emailRef.current.focus();
                      }

                      if (password === '') {
                        passwordRef.current.focus();
                      }
                    }
                  }}
                >
                  {status === 'idle' ? 'Register' : 'Loading'}
                </button>
              </div>
              <div className='register-container'>
                <span><small>Already have an account? <a href='/'>Login</a></small></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}





export default Register;
