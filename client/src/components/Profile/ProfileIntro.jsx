import React from 'react';
import {
    PencilIcon,
    HomeIcon,
    MapPinIcon,
    CakeIcon,
    HeartIcon,
    UserIcon,
    BriefcaseIcon,
    AcademicCapIcon
} from '@heroicons/react/24/solid';

const ProfileIntro = ({ user, isOwnProfile, setIsEditModalOpen }) => {
    return (
        <div className="space-y-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                    {isOwnProfile && (
                        <PencilIcon
                            className="h-4 w-4 text-gray-500 cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => setIsEditModalOpen(true)}
                        />
                    )}
                </div>

                <div className="space-y-4">
                    {user?.location && (
                        <div className="flex items-start space-x-3 text-[15px]">
                            <HomeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <span>Sống ở <span className="font-bold">{user.location}</span></span>
                        </div>
                    )}
                    {user?.hometown && (
                        <div className="flex items-start space-x-3 text-[15px]">
                            <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <span>Đến từ <span className="font-bold">{user.hometown}</span></span>
                        </div>
                    )}
                    {user?.dateOfBirth && (
                        <div className="flex items-start space-x-3 text-[15px]">
                            <CakeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <span>Sinh nhật <span className="font-bold">{new Date(user.dateOfBirth).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
                        </div>
                    )}
                    <div className="flex items-start space-x-3 text-[15px]">
                        <HeartIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                        <span className="capitalize">{user?.relationshipStatus ? (user.relationshipStatus === 'single' ? 'Độc thân' : user.relationshipStatus === 'in_relationship' ? 'Hẹn hò' : user.relationshipStatus === 'married' ? 'Đã kết hôn' : 'Phức tạp') : 'Độc thân'}</span>
                    </div>
                    {user?.gender && (
                        <div className="flex items-start space-x-3 text-[15px]">
                            <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <span>{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Work & Education Section */}
            {(user?.work || user?.education) && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Công việc & Học vấn</h2>
                        {isOwnProfile && (
                            <button onClick={() => setIsEditModalOpen(true)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {user?.work && (
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                    {user.work.substring(0, 4).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[15px]">{user.work}</p>
                                    <p className="text-sm text-gray-500">Nhân viên</p>
                                </div>
                            </div>
                        )}
                        {user?.education && (
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                                    {user.education.substring(0, 4).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[15px]">{user.education}</p>
                                    <p className="text-sm text-gray-500">Sinh viên</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileIntro;
