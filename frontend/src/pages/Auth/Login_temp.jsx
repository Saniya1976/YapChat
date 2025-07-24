import React from 'react';
import { useNavigate } from 'react-router-dom'; // Don't forget this!
import AuthLayout from '../../components/layouts/AuthLayout';

const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Add your login logic here
  };

  return (
    <AuthLayout>
      <div>
        <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
          <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
          <p className="text-xs text-slate-700 mt-[5px] mb-6">
            Please enter your details to log in
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
