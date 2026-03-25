import React from 'react';
import {
    UserCircleIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    BellIcon,
    LanguageIcon,
    PowerIcon,
    QuestionMarkCircleIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const SettingsSidebar = ({ activeSection, setActiveSection }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const mainSettings = [
        { id: 'account', label: 'Tài khoản', icon: UserCircleIcon },
        { id: 'security', label: 'Mật khẩu và bảo mật', icon: ShieldCheckIcon },
        { id: 'privacy', label: 'Quyền riêng tư', icon: LockClosedIcon },
        { id: 'notifications', label: 'Thông báo', icon: BellIcon },
    ];

    const otherSettings = [
        { id: 'language', label: 'Ngôn ngữ', icon: LanguageIcon },
        { id: 'support', label: 'Hỗ trợ & Trợ giúp', icon: QuestionMarkCircleIcon },
    ];

    const filteredMain = mainSettings.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOther = otherSettings.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Logic for logout (e.g., clearing token, redirecting)
            window.location.href = '/login';
        }
    };

    return (
        <div className="w-full lg:w-90 bg-white dark:bg-gray-800 shadow-sm h-full overflow-y-auto p-4 border-r dark:border-gray-700 flex flex-col font-segoe">
            <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Tìm kiếm cài đặt"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-0 focus:ring-0 focus:bg-white dark:focus:bg-gray-600 text-sm dark:text-white"
                />
            </div>

            <div className="flex flex-col space-y-1 mb-6">
                {filteredMain.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${activeSection === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <div className={`p-1.5 rounded-full ${activeSection === item.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        <ChevronRightIcon className="h-4 w-4 opacity-30 px-px" />
                    </button>
                ))}
            </div>

            {filteredOther.length > 0 && (
                <div className="border-t dark:border-gray-700 pt-4 mb-6">
                    {filteredOther.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${activeSection === item.id
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`p-1.5 rounded-full ${activeSection === item.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                }`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="flex-1 text-left text-sm">{item.label}</span>
                            <ChevronRightIcon className="h-4 w-4 opacity-30 px-px" />
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-auto border-t dark:border-gray-700 pt-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/40">
                        <PowerIcon className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-left text-sm">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default SettingsSidebar;
