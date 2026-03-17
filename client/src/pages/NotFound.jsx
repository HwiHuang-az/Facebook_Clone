import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <div className="mb-6">
          <img 
            src="https://www.facebook.com/images/comet/empty_states_dark/error.svg" 
            alt="Error" 
            className="w-32 h-32 mx-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Trang này hiện không khả dụng</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Liên kết có thể bị hỏng hoặc trang đã bị gỡ. Hãy kiểm tra xem liên kết mà bạn đang cố mở có chính xác không.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đi tới Bảng tin
        </button>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 text-blue-600 font-semibold hover:underline"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default NotFound;
