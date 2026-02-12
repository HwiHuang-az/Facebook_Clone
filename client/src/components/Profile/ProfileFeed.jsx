import React from 'react';
import Post from '../Home/Post';
import {
    VideoCameraIcon,
    PhotoIcon,
    FlagIcon,
    AdjustmentsVerticalIcon,
    Cog6ToothIcon,
    ListBulletIcon,
    Squares2X2Icon
} from '@heroicons/react/24/solid';
import classNames from 'classnames';

const ProfileFeed = ({ user, isOwnProfile, posts, postLoading, viewMode, setViewMode }) => {
    return (
        <>
            {isOwnProfile && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <img
                            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=2563EB&color=fff`}
                            className="w-10 h-10 rounded-full"
                            alt=""
                        />
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full py-2 px-4 text-left text-gray-500">
                            Bạn đang nghĩ gì?
                        </button>
                    </div>
                    <div className="flex border-t pt-2">
                        <button className="flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg space-x-2 transition-colors">
                            <VideoCameraIcon className="h-6 w-6 text-red-500" />
                            <span className="text-gray-600 font-semibold text-sm">Video trực tiếp</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg space-x-2 transition-colors">
                            <PhotoIcon className="h-6 w-6 text-green-500" />
                            <span className="text-gray-600 font-semibold text-sm">Ảnh/video</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg space-x-2 transition-colors">
                            <FlagIcon className="h-6 w-6 text-blue-400" />
                            <span className="text-gray-600 font-semibold text-sm">Cột mốc</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Post Management Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Bài viết</h2>
                    <div className="flex space-x-2">
                        <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm font-semibold">
                            <AdjustmentsVerticalIcon className="h-5 w-5" />
                            <span>Bộ lọc</span>
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm font-semibold">
                            <Cog6ToothIcon className="h-5 w-5" />
                            <span>Quản lý bài viết</span>
                        </button>
                    </div>
                </div>
                <div className="flex border-t pt-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={classNames(
                            "flex-1 flex items-center justify-center py-2 transition-colors",
                            viewMode === 'list' ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <ListBulletIcon className="h-5 w-5 mr-2" />
                        <span className="font-semibold text-sm">Chế độ xem danh sách</span>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={classNames(
                            "flex-1 flex items-center justify-center py-2 transition-colors",
                            viewMode === 'grid' ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <Squares2X2Icon className="h-5 w-5 mr-2" />
                        <span className="font-semibold text-sm">Chế độ xem lưới</span>
                    </button>
                </div>
            </div>

            <div className={classNames(
                "space-y-4",
                viewMode === 'grid' ? "grid grid-cols-3 gap-1 space-y-0" : ""
            )}>
                {postLoading ? (
                    <div className={classNames(
                        "text-center py-10 bg-white rounded-lg shadow-sm w-full",
                        viewMode === 'grid' ? "col-span-3" : ""
                    )}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={classNames(
                        "bg-white p-10 text-center rounded-lg shadow-sm text-gray-500 font-bold border w-full",
                        viewMode === 'grid' ? "col-span-3" : ""
                    )}>
                        Chưa có bài viết nào
                    </div>
                ) : viewMode === 'list' ? (
                    posts.map((post) => (
                        <Post key={post.id} post={post} />
                    ))
                ) : (
                    posts.filter(p => p.imageUrl).map((post) => (
                        <div key={post.id} className="aspect-square w-full relative group cursor-pointer">
                            <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default ProfileFeed;
