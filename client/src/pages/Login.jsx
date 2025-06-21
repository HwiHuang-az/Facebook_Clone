import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import ErrorDisplay from '../components/UI/ErrorDisplay';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [errors, setErrors] = useState([]);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      await login(formData.email, formData.password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Đăng nhập thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Side - Facebook Branding */}
          <div className="text-center lg:text-left">
            <div className="mb-4">
              <h1 className="text-6xl font-bold text-facebook-600 tracking-tight">
                facebook
              </h1>
            </div>
            <p className="text-2xl font-normal text-gray-900 max-w-lg">
              Facebook giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống của bạn.
            </p>
          </div>

          {/* Right Side - Login Form */}
          <div className="max-w-md w-full mx-auto lg:mx-0">
            <div className="bg-white rounded-lg shadow-facebook p-6">
              {/* Error Display */}
              <ErrorDisplay errors={errors} className="mb-4" />
              
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email hoặc số điện thoại"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-facebook text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-facebook-600 focus:border-facebook-600 text-lg"
                  />
                </div>
                
                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-facebook text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-facebook-600 focus:border-facebook-600 text-lg"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-facebook shadow-facebook-button text-lg font-bold text-white bg-facebook-600 hover:bg-facebook-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-facebook-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang đăng nhập...
                      </div>
                    ) : 'Đăng nhập'}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link 
                    to="/forgot-password"
                    className="text-facebook-600 hover:text-facebook-700 text-sm hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-6 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                </div>
              </div>

              {/* Sign Up Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowSignUp(true)}
                  className="px-6 py-3 border border-transparent rounded-facebook text-lg font-bold text-white bg-success hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-facebook-button transition-colors duration-200"
                >
                  Tạo tài khoản mới
                </button>
              </div>
            </div>

            {/* Create Page Link */}
            <div className="mt-6 text-center">
              <Link 
                to="/create-page"
                className="text-gray-900 hover:underline text-sm"
              >
                <strong>Tạo Trang</strong> dành cho người nổi tiếng, thương hiệu hoặc doanh nghiệp.
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      {showSignUp && (
        <SignUpModal onClose={() => setShowSignUp(false)} />
      )}
    </div>
  );
};

// Sign Up Modal Component
const SignUpModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const { register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      await register(formData);
      toast.success('Đăng ký thành công!');
      onClose();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Đăng ký thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-facebook shadow-modal max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
              <p className="text-sm text-gray-500">Nhanh chóng và dễ dàng.</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>

        {/* Error Display */}
        <div className="px-4">
          <ErrorDisplay errors={errors} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <input
              name="firstName"
              type="text"
              placeholder="Tên"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-facebook text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-facebook-600 focus:border-facebook-600"
            />
            <input
              name="lastName"
              type="text"
              placeholder="Họ"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-facebook text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-facebook-600 focus:border-facebook-600"
            />
          </div>

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-facebook text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-facebook-600 focus:border-facebook-600"
          />

          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu mới"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-facebook text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-facebook-600 focus:border-facebook-600"
          />

          {/* Date of Birth */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Ngày sinh
            </label>
            <input
              name="dateOfBirth"
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-facebook text-gray-900 focus:outline-none focus:ring-1 focus:ring-facebook-600 focus:border-facebook-600"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Giới tính <span className="text-gray-400">ⓘ</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center border border-gray-300 rounded-facebook px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  onChange={handleInputChange}
                  className="mr-2 text-facebook-600 focus:ring-facebook-500"
                />
                <span className="text-sm">Nữ</span>
              </label>
              <label className="flex items-center border border-gray-300 rounded-facebook px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  onChange={handleInputChange}
                  className="mr-2 text-facebook-600 focus:ring-facebook-500"
                />
                <span className="text-sm">Nam</span>
              </label>
              <label className="flex items-center border border-gray-300 rounded-facebook px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  onChange={handleInputChange}
                  className="mr-2 text-facebook-600 focus:ring-facebook-500"
                />
                <span className="text-sm">Tùy chỉnh</span>
              </label>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 leading-relaxed">
            Bằng cách nhấp vào Đăng ký, bạn đồng ý với{' '}
            <Link to="/terms" className="text-facebook-600 hover:underline">Điều khoản</Link>,{' '}
            <Link to="/privacy" className="text-facebook-600 hover:underline">Chính sách quyền riêng tư</Link> và{' '}
            <Link to="/cookies" className="text-facebook-600 hover:underline">Chính sách cookie</Link> của chúng tôi.
          </p>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-2 border border-transparent rounded-facebook text-lg font-bold text-white bg-success hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-facebook-button transition-colors duration-200"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 