import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import './Register.css';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState(''); 
  const [lastName, setLastName] = useState('');
  const [contactNo, setContactNo] = useState('');
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
  const userInputDebounce = useDebounce(
    { email, password, firstName, middleName, lastName, contactNo, role },
    2000
  );
  const [debounceState, setDebounceState] = useState(false);
  const [status, setStatus] = useState('idle');

  const navigate = useNavigate();

  const handleShowPassword = useCallback(() => {
    setIsShowPassword((value) => !value);
  }, [isShowPassword]);

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
        setContactNo(event.target.value);
        break;

      case 'role':
        setRole(event.target.value);
        break;

      default:
        break;
    }
  };

  const handleRegister = async () => {
    const data = { email, password, firstName, middleName, lastName, contactNo, role }; 
    setStatus('loading');
    console.log(data);

    await axios({
      method: 'post',
      url: '/user/register',
      data,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
      .then((res) => {
        console.log(res);
        localStorage.setItem('accessToken', res.data.access_token);
        navigate('/');
        setStatus('idle');
      })
      .catch((e) => {
        console.log(e);
        setStatus('idle');
        alert(e.response.data.message);
      });
  };

  useEffect(() => {
    setDebounceState(true);
  }, [userInputDebounce]);

  return (
    <div className='Register'>
      <div className='main-container'>
        <h3 className='h3-register'>Register</h3>
        <form>
          <div className='form-container'>
            <div>
              <div className='form-group'>
                <label style={{ color: 'rgb(196, 196, 196)' }}>First Name:</label>
                <input
                  type='text'
                  name='firstName'
                  ref={firstNameRef}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    outline: '1px solid rgb(196, 196, 196)',
                  }}
                  onChange={(e) => handleOnChange(e, 'firstName')}
                />
              </div>
            </div>
            <div>
              <div className='form-group'>
                <label style={{ color: 'rgb(196, 196, 196)' }}>Middle Name:</label>
                <input
                  type='text'
                  name='middleName'
                  ref={middleNameRef} 
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    outline: '1px solid rgb(196, 196, 196)',
                  }}
                  onChange={(e) => handleOnChange(e, 'middleName')} 
                />
              </div>
            </div>
            <div>
              <div className='form-group'>
                <label style={{ color: 'rgb(196, 196, 196)' }}>Last Name:</label>
                <input
                  type='text'
                  name='lastName'
                  ref={lastNameRef}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    outline: '1px solid rgb(196, 196, 196)',
                  }}
                  onChange={(e) => handleOnChange(e, 'lastName')}
                />
              </div>
            </div>
            <div>
              <div className='form-group'>
                <label style={{ color: 'rgb(196, 196, 196)' }}>Contact Number:</label>
                <input
                  type='text'
                  name='contactNo'
                  ref={contactNoRef}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    outline: '1px solid rgb(196, 196, 196)',
                  }}
                  onChange={(e) => handleOnChange(e, 'contactNo')}
                />
              </div>
            </div>
            <div>
              <div className='form-group'>
                <label style={{ color: 'rgb(196, 196, 196)' }}>Role:</label>
                <input
                  type='text'
                  name='role'
                  ref={roleRef}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    outline: '1px solid rgb(196, 196, 196)',
                  }}
                  onChange={(e) => handleOnChange(e, 'role')}
                />
              </div>
            </div>
            <div>
              <div className='form-group'>
                <label style={{ color: 'rgb(196, 196, 196)' }}>Email:</label>
                <input
                  type='text'
                  name='email'
                  ref={emailRef}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    outline: '1px solid rgb(196, 196, 196)',
                  }}
                  onChange={(e) => handleOnChange(e, 'email')}
                />
              </div>
            </div>
            <div>
              <div className='form-group'>
                <label style={{ color: 'rgb(196, 196, 196)' }}>Password:</label>
                <input
                  type={isShowPassword ? 'text' : 'password'}
                  name='password'
                  ref={passwordRef}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    outline: '1px solid rgb(196, 196, 196)',
                  }}
                  onChange={(e) => handleOnChange(e, 'password')}
                />
              </div>
            </div>
            <div
              className='show-password'
              onClick={handleShowPassword}
              style={{ color: 'rgb(196, 196, 196)', cursor: 'pointer' }}
            >
              {isShowPassword ? 'Hide' : 'Show'} Password
            </div>

            <div className='submit-container'>
              <button
                type='button'
                disabled={status === 'loading'}
                onClick={handleRegister}
              >
                {status === 'idle' ? 'Register' : 'Loading'}
              </button>
            </div>
            <div className='register-container'>
              <span>
                <small style={{ color: 'rgb(196, 196, 196)' }}>
                  Already have an account? <a href='/'>Login</a>
                </small>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
