import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Welcome Back</h1>
        
        <form className="space-y-4">
          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18}/>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              placeholder="Email"
              required
            />
          </div>

          {/* Password Field with Toggle */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18}/>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            Sign In <ArrowRight size={18}/>
          </button>
        </form>

        <p className="text-slate-300 text-sm mt-4 text-center">
          Don't have an account? <a href="#" className="text-blue-400">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;