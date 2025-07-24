import React from 'react'
import {FaRegEye, FaRegEyeSlash} from 'react-icons/fa6'
const Input = ({ type, placeholder, value, onChange ,label}) => {
    const[showPassword,setShowPassword]=React.useState(false);
    const toggleShowPassword=()=>{
        setShowPassword(!showPassword);
    }
  return (
    <div>
      <label className="text-[13px]  text-slate-800 ">{label}</label>
      <div className="input-box">
      <input
        type={type === 'password' && !showPassword ? 'password' : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className=" width-full bg-transparent outline-none"
      />
        {type === 'password' && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
            {showPassword ? <FaRegEyeSlash onClick={toggleShowPassword} /> : <FaRegEye onClick={toggleShowPassword} />}
            </span>
        )}
      </div>
      {type === 'password' && (
        <button
          type="button"
          onClick={toggleShowPassword}
          className="text-sm text-purple-600 hover:underline"
        >
          {showPassword ? 'Hide' : 'Show'} Password
        </button>
      )}
    </div>
  )
}

export default Input;
