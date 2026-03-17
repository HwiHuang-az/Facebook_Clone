import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg w-full">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Đã có lỗi xảy ra</h1>
            <p className="text-gray-600 mb-8">
              Rất tiếc, ứng dụng đã gặp sự cố không mong muốn. Chúng tôi đã ghi nhận lỗi này và sẽ khắc phục sớm nhất có thể.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              Tải lại trang
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-500 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
