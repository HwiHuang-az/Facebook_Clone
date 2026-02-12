import React from 'react';
import {
    BriefcaseIcon,
    AcademicCapIcon,
    HomeIcon,
    HeartIcon,
    UserIcon,
    CakeIcon
} from '@heroicons/react/24/solid';
import classNames from 'classnames';

const ProfileAbout = ({ user, aboutSubTab, setAboutSubTab }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]">
            {/* About Tabs Sidebar */}
            <div className="w-full md:w-1/3 bg-gray-50 border-r py-2">
                <h2 className="px-4 py-2 text-xl font-bold mb-2">Giới thiệu</h2>
                {[
                    { id: 'overview', label: 'Tổng quan' },
                    { id: 'work', label: 'Công việc và học vấn' },
                    { id: 'places', label: 'Nơi từng sống' },
                    { id: 'contact', label: 'Thông tin liên hệ và cơ bản' },
                    { id: 'family', label: 'Gia đình và các mối quan hệ' },
                ].map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => setAboutSubTab(sub.id)}
                        className={classNames(
                            "w-full text-left px-4 py-2.5 text-[15px] font-semibold transition-colors",
                            aboutSubTab === sub.id ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        {sub.label}
                    </button>
                ))}
            </div>

            {/* About Content Area */}
            <div className="flex-1 p-6">
                {aboutSubTab === 'overview' && (
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-bold">Tổng quan</h3>
                        <div className="space-y-4">
                            {user?.work && (
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                                    <span>Làm việc tại <span className="font-bold text-gray-900">{user.work}</span></span>
                                </div>
                            )}
                            {user?.education && (
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                                    <span>Từng học tại <span className="font-bold text-gray-900">{user.education}</span></span>
                                </div>
                            )}
                            {user?.location && (
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <HomeIcon className="h-6 w-6 text-gray-400" />
                                    <span>Sống tại <span className="font-bold text-gray-900">{user.location}</span></span>
                                </div>
                            )}
                            <div className="flex items-center space-x-3 text-gray-600">
                                <HeartIcon className="h-6 w-6 text-gray-400" />
                                <span>{user?.relationshipStatus === 'single' ? 'Độc thân' : 'Trong một mối quan hệ'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {aboutSubTab === 'work' && (
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-bold">Công việc và học vấn</h3>
                        <div className="space-y-8">
                            <div>
                                <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Công việc</p>
                                {user?.work ? (
                                    <div className="flex items-center space-x-3">
                                        <BriefcaseIcon className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <p className="font-bold">{user.work}</p>
                                            <p className="text-sm text-gray-500">Nhân viên</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Chưa có thông tin công việc</p>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Học vấn</p>
                                {user?.education ? (
                                    <div className="flex items-center space-x-3">
                                        <AcademicCapIcon className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <p className="font-bold">{user.education}</p>
                                            <p className="text-sm text-gray-500">Sinh viên</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Chưa có thông tin học vấn</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {aboutSubTab === 'places' && (
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-bold">Nơi từng sống</h3>
                        <div className="space-y-4">
                            {user?.location && (
                                <div className="flex items-center space-x-3">
                                    <HomeIcon className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <p className="font-bold">{user.location}</p>
                                        <p className="text-sm text-gray-500">Tỉnh/Thành phố hiện tại</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {aboutSubTab === 'contact' && (
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-bold">Thông tin liên hệ và cơ bản</h3>
                        <div className="space-y-8">
                            <div>
                                <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Thông tin liên hệ</p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <UserIcon className="h-6 w-6 text-gray-400" />
                                        <div>
                                            <p className="font-bold">{user.email}</p>
                                            <p className="text-sm text-gray-500">Email</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Thông tin cơ bản</p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CakeIcon className="h-6 w-6 text-gray-400" />
                                        <div>
                                            <p className="font-bold">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Chưa cập nhật'}</p>
                                            <p className="text-sm text-gray-500">Ngày sinh</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <UserIcon className="h-6 w-6 text-gray-400" />
                                        <div>
                                            <p className="font-bold">{user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}</p>
                                            <p className="text-sm text-gray-500">Giới tính</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {aboutSubTab === 'family' && (
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-bold">Gia đình và các mối quan hệ</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <HeartIcon className="h-8 w-8 text-gray-400" />
                                <div>
                                    <p className="font-bold">{user?.relationshipStatus ? (user.relationshipStatus === 'single' ? 'Độc thân' : user.relationshipStatus === 'in_relationship' ? 'Hẹn hò' : user.relationshipStatus === 'married' ? 'Đã kết hôn' : 'Phức tạp') : 'Độc thân'}</p>
                                    <p className="text-sm text-gray-500">Tình trạng mối quan hệ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileAbout;
