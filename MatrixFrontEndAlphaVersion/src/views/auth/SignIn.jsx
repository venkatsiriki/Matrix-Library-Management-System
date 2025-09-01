import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiShield } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import styled from 'styled-components';
import axios from 'axios';
import { API_URL } from '../../api/config';

// Import images
import studentImage from "../../assets/img/auth/student.png";
import adminImage from "../../assets/img/auth/admin.PNG";
import authBg from "../../assets/img/auth/auth-bg.png";

// API URL
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Role images mapping
const ROLE_IMAGES = {
  student: studentImage,
  admin: adminImage
};

// Simple hello messages in different languages - English first
const welcomeMessages = [
  "Hello",                    // English (always first)
  "నమస్కారం",              // Telugu
  "नमस्ते",                  // Hindi
  "வணக்கம்",           // Tamil
  "স্বাগতম",              // Bengali
  "Akwaaba",            // Twi
  "Bonjour"            // French
];

const GradientBackground = styled.div`
  * {
    cursor: default;
  }
        
  input {
    cursor: text;
  }

  button {
    cursor: pointer;
  }

  .container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: ${props => props.isDarkMode ? 
      'linear-gradient(135deg, #000000 0%, #0a0520 100%)' : 
      'linear-gradient(135deg, #ffe8f3, #d9f3ff)'};
    
    ${props => props.isDarkMode && `
      &::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at center,
          transparent 70%,
          rgba(10, 5, 32, 0.9) 100%
        );
        animation: aurora-pulse 8s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
      }

      background: radial-gradient(
          ellipse at 20% 30%,
          rgba(138, 43, 226, 0.8) 0%,
          rgba(138, 43, 226, 0) 60%
        ),
        radial-gradient(
          ellipse at 80% 50%,
          rgba(0, 191, 255, 0.7) 0%,
          rgba(0, 191, 255, 0) 70%
        ),
        radial-gradient(
          ellipse at 50% 80%,
          rgba(50, 205, 50, 0.6) 0%,
          rgba(50, 205, 50, 0) 65%
        ),
        linear-gradient(135deg, #000000 0%, #0a0520 100%);
      background-blend-mode: overlay, screen, hard-light;
      animation: aurora-drift 35s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    `}
  }

  ${props => !props.isDarkMode && `
    .container::before,
    .container::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(
        from 0deg,
        #ff9aa2,
        #ffb7b2,
        #ffdac1,
        #e2f0cb,
        #a2e4ff,
        #c9afff,
        #ffb7b2,
        #ff9aa2
      );
      transform: translate(-50%, -50%);
      animation: rotate 8s linear infinite;
      filter: blur(50px);
      opacity: 0.8;
    }

    .container::after {
      width: 180%;
      height: 180%;
      animation: rotate-reverse 10s linear infinite;
      opacity: 0.6;
    }
  `}

  @keyframes aurora-drift {
    0% {
      background-position:
        0% 0%,
        0% 0%,
        0% 0%;
      filter: hue-rotate(0deg) brightness(1);
    }
    25% {
      background-position:
        -15% -5%,
        10% 10%,
        5% 15%;
      filter: hue-rotate(15deg) brightness(1.1);
    }
    50% {
      background-position:
        -10% -15%,
        15% 15%,
        10% 10%;
      filter: hue-rotate(30deg) brightness(1.2);
    }
    75% {
      background-position:
        -5% -10%,
        10% 5%,
        15% 5%;
      filter: hue-rotate(45deg) brightness(1.1);
    }
    100% {
      background-position:
        5% 15%,
        -15% -10%,
        20% 0%;
      filter: hue-rotate(60deg) brightness(1);
    }
  }

  @keyframes aurora-pulse {
    0% {
      opacity: 0.8;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.05);
    }
    100% {
      opacity: 0.8;
      transform: scale(1);
    }
  }

  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes rotate-reverse {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(-360deg);
    }
  }
`;

const InputField = ({ 
  icon: Icon,
  type,
  placeholder,
  name,
  value,
  onChange,
  isDarkMode
}) => (
  <div className="relative mb-4" style={{ cursor: 'default' }}>
    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`} style={{ cursor: 'default' }}>
      <Icon className="w-5 h-5" style={{ cursor: 'default' }} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${
        isDarkMode 
          ? 'bg-gray-800/50 text-white placeholder-gray-500 focus:bg-gray-800/80 border border-gray-700 focus:border-blue-500' 
          : 'bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white border border-gray-200 focus:border-blue-500'
      }`}
      style={{ cursor: 'text' }}
    />
  </div>
);

const LoginForm = ({ userType, formData, handleInputChange, handleSubmit, handleGoogleLogin, error, isLoading, isDarkMode }) => {
  const textStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    cursor: 'default'
  };

  return (
    <div className="space-y-6" style={textStyle}>
      <div className="space-y-2">
        <InputField
          icon={FiMail}
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          isDarkMode={isDarkMode}
        />
        <InputField
          icon={FiLock}
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          isDarkMode={isDarkMode}
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg ${
            isDarkMode 
              ? 'bg-red-900/20 text-red-200 border border-red-900/50' 
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <button
          type="submit"
          disabled={isLoading}
          onClick={handleSubmit}
          className={`w-full relative overflow-hidden rounded-xl py-3.5 font-medium transition-all select-none ${
            isDarkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600'
          }`}
          style={textStyle}
        >
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center"
            >
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${
              isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'
            }`}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-xl font-medium transition-all select-none ${
            isDarkMode
              ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700 focus:bg-gray-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:bg-gray-50'
          }`}
          style={textStyle}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p 
          className={`text-center text-sm select-none ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={textStyle}
        >
          {userType === 'admin' 
            ? 'Access your Admin Dashboard' 
            : 'Access your Student Dashboard'}
        </p>
      </div>
    </div>
  );
};

const AnimatedWelcome = React.memo(({ isDarkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setCurrentIndex(0);

    const animationInterval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % welcomeMessages.length);
        setIsVisible(true);
      }, 600);
      
    }, 3000);

    return () => {
      clearInterval(animationInterval);
    };
  }, []);

  const textStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    cursor: 'default'
  };

  return (
    <div 
      className="h-[40px] relative flex items-center justify-center overflow-hidden" 
      style={textStyle}
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={`text-2xl font-medium text-center select-none ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
        style={textStyle}
      >
        {welcomeMessages[currentIndex]}
      </motion.div>
    </div>
  );
});

AnimatedWelcome.displayName = 'AnimatedWelcome';

const StyledRoleToggle = styled.div`
  * {
    cursor: default;
  }

  label {
    cursor: pointer;
  }

  .glass-radio-group {
    --bg: ${props => props.isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(255, 255, 255, 0.2)'};
    --text: ${props => props.isDarkMode ? '#9ca3af' : '#4b5563'};

    display: flex;
    position: relative;
    background: var(--bg);
    border-radius: 1rem;
    backdrop-filter: blur(12px);
    box-shadow: ${props => props.isDarkMode ?
      `inset 1px 1px 4px rgba(255, 255, 255, 0.1),
       inset -1px -1px 6px rgba(0, 0, 0, 0.3),
       0 4px 12px rgba(0, 0, 0, 0.2)` :
      `inset 1px 1px 4px rgba(255, 255, 255, 0.4),
       inset -1px -1px 6px rgba(0, 0, 0, 0.1),
       0 4px 12px rgba(0, 0, 0, 0.05)`
    };
    overflow: hidden;
    width: 100%;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .glass-radio-group input {
    display: none;
  }

  .glass-radio-group label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem;
    cursor: pointer;
    font-weight: 500;
    color: var(--text);
    position: relative;
    z-index: 2;
    transition: color 0.3s ease-in-out;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .glass-radio-group label:hover {
    color: ${props => props.isDarkMode ? '#fff' : '#111827'};
  }

  .glass-radio-group input:checked + label {
    color: ${props => props.isDarkMode ? '#fff' : '#111827'};
  }

  .glass-glider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    border-radius: 1rem;
    z-index: 1;
    transition: transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
                background 0.4s ease-in-out,
                box-shadow 0.4s ease-in-out;
  }

  #role-student:checked ~ .glass-glider {
    transform: translateX(0%);
    background: ${props => props.isDarkMode ?
      'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.8))' :
      'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(243, 244, 246, 0.9))'
    };
    box-shadow: ${props => props.isDarkMode ?
      '0 0 18px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.1) inset' :
      '0 0 18px rgba(0, 0, 0, 0.05), 0 0 10px rgba(255, 255, 255, 0.5) inset'
    };
  }

  #role-admin:checked ~ .glass-glider {
    transform: translateX(100%);
    background: ${props => props.isDarkMode ?
      'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.8))' :
      'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(243, 244, 246, 0.9))'
    };
    box-shadow: ${props => props.isDarkMode ?
      '0 0 18px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.1) inset' :
      '0 0 18px rgba(0, 0, 0, 0.05), 0 0 10px rgba(255, 255, 255, 0.5) inset'
    };
  }

  .glass-radio-group label span {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
`;

const RoleToggle = ({ userType, onChange, isDarkMode }) => {
  return (
    <StyledRoleToggle isDarkMode={isDarkMode}>
      <div className="glass-radio-group">
        <input
          type="radio"
          name="role"
          id="role-student"
          checked={userType === "student"}
          onChange={() => onChange("student")}
        />
        <label htmlFor="role-student">
          <FiUser className="w-4 h-4" />
          <span>Student</span>
        </label>
        <input
          type="radio"
          name="role"
          id="role-admin"
          checked={userType === "admin"}
          onChange={() => onChange("admin")}
        />
        <label htmlFor="role-admin">
          <FiShield className="w-4 h-4" />
          <span>Admin</span>
        </label>
        <div className="glass-glider" />
      </div>
    </StyledRoleToggle>
  );
};

const noSelectStyle = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  cursor: 'default'
};

const MainContainer = styled.div`
  * {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    cursor: default;
  }

  input {
    cursor: text;
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
  }

  button, label {
    cursor: pointer;
  }
`;

const PageBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${props => props.bgImage});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: ${props => props.isDarkMode ? '0.25' : '0.7'};
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    backdrop-filter: blur(10px);
    background: ${props => props.isDarkMode ? 
      'linear-gradient(135deg, rgba(3, 7, 18, 0.95), rgba(17, 24, 39, 0.95))' : 
      'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.25))'
    };
  }
`;

export default function SignIn() {
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Preload images when component mounts
  useEffect(() => {
    const studentImg = new Image();
    const adminImg = new Image();
    studentImg.src = studentImage;
    adminImg.src = adminImage;
    studentImg.onload = () => console.log('Student image preloaded');
    adminImg.onload = () => console.log('Admin image preloaded');
  }, []);

  // Check for existing token and redirect if authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
              axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const { role } = response.data.user;
          navigate(role === 'admin' ? '/admin' : '/student');
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
  }, [navigate]);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({ email: "", password: "" });
    setError("");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Client-side role validation removed - allow any admin email

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: userType
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const { role, name, email } = response.data.user;
        
        // Validate role matches userType
        if (role !== userType) {
          setError(`Invalid role: this account is for ${role}, not ${userType}`);
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }
        
        // Store minimal user data
        const userData = {
          email,
          role,
          name,
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        };
        localStorage.setItem('user', JSON.stringify(userData));
        navigate(role === 'admin' ? '/admin' : '/student');
      } else {
        setError('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <MainContainer>
      <PageBackground 
        isDarkMode={isDarkMode} 
        bgImage={authBg}
      />
      <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full max-w-[1000px] h-[600px] flex flex-col md:flex-row rounded-2xl relative overflow-hidden backdrop-blur-md
            ${isDarkMode 
              ? 'bg-gray-900/5 shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),0_0_25px_-5px_rgba(59,130,246,0.1)] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.2),0_0_30px_-6px_rgba(59,130,246,0.15)]' 
              : 'bg-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.12),0_0_25px_-5px_rgba(0,0,0,0.08)] hover:shadow-[0_0_50px_-12px_rgba(0,0,0,0.16),0_0_30px_-6px_rgba(0,0,0,0.12)]'
            } transition-shadow duration-500`}
        >
          {/* Form Section */}
          <div className="relative w-full md:w-[400px] flex flex-col min-h-[600px] md:min-h-0 overflow-hidden rounded-2xl md:rounded-r-none">
            <GradientBackground isDarkMode={isDarkMode}>
              <div className="container" />
            </GradientBackground>

            {/* Glass overlay */}
            <div className={`absolute inset-0 ${
              isDarkMode 
                ? 'bg-gray-900/5 backdrop-blur-[1px]' 
                : 'bg-white/5 backdrop-blur-[1px]'
            }`} />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
              <div className="w-full max-w-[320px]">
                {/* Matrix Logo */}
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                    isDarkMode 
                      ? 'from-purple-500 via-blue-500 to-emerald-500' 
                      : 'from-pink-500 via-purple-500 to-indigo-500'
                  } font-['Audiowide'] tracking-wider`}>
                    MATRIX
                  </h3>
                </div>

                {/* Header with Animated Welcome */}
                <div className="text-center mb-8">
                  <AnimatedWelcome isDarkMode={isDarkMode} />
                </div>

                {/* Role Toggle */}
                <div className="mb-8">
                  <RoleToggle
                    userType={userType}
                    onChange={handleUserTypeChange}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Form with Slide Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={userType}
                    initial={{ x: 0, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full"
                  >
                    <LoginForm
                      userType={userType}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleSubmit={handleSubmit}
                      handleGoogleLogin={handleGoogleLogin}
                      error={error}
                      isLoading={isLoading}
                      isDarkMode={isDarkMode}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative hidden md:block flex-1 rounded-r-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={userType}
                initial={{ opacity: 0, scale: 1.1, x: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  filter: "blur(0px)"
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.95,
                  x: 0,
                  filter: "blur(8px)"
                }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                  scale: {
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1]
                  },
                  filter: {
                    duration: 0.4
                  }
                }}
                className="absolute inset-0"
              >
                <motion.img
                  src={ROLE_IMAGES[userType]}
                  alt={`${userType} background`}
                  className="w-full h-full object-cover"
                  draggable="false"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  style={{
                    willChange: 'transform'
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </MainContainer>
  );
}