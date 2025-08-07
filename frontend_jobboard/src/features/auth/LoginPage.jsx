import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from './authSlice';

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const { username, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message); // Simple error display for now
    }
    if (isSuccess || user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { username, password };
    dispatch(login(userData));
  };

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  return (
    <>
      <section>
        <h1>Login</h1>
        <p>Please log in to your account</p>
      </section>

      <section>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="username"
            value={username}
            placeholder="Enter your username"
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Enter password"
            onChange={onChange}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </section>
    </>
  );
}

export default LoginPage;