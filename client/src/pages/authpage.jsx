import { useState } from "react";
import { Link } from "react-router-dom";
import LoginImg from "../assets/loginImg.jpg";
import googleIcon from "../assets/googleIcon.svg";
import Bg from "../assets/loginBg.jpg";

export function LoginForm() {
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const googleAuth = () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/google`, "_self");
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-cover bg-center bg-red-900 opacity-100"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      <div className="flex w-full max-w-4xl bg-white/20 backdrop-blur-md shadow-2xl rounded-3xl border border-white/30 overflow-hidden">
        <div className="hidden md:flex w-1/2 ">
          <img
            src={LoginImg}
            alt="Login Visual"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-left mb-6 text-slate tracking-wide">
            {isSignUp ? "Create an Account" : "Login to Your Account"}
          </h2>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={googleAuth}
            className="flex items-center justify-start w-full p-3 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition duration-300 shadow-md border border-gray-300"
          >
            <img src={googleIcon} alt="Google Icon" className="w-6 h-6 mr-3" />
            <span className="font-medium tracking-wide font-extrabold ml-[60px]">
              {isSignUp ? "Sign Up with Google" : "Sign in with Google"}
            </span>
          </button>

          <div className="mt-6 text-left text-sm text-black">
            <span>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-500 font-semibold underline hover:text-gray-200 transition"
            >
              {isSignUp ? " Login" : " Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
