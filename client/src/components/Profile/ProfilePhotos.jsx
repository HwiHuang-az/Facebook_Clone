import React from 'react';

const ProfilePhotos = ({ posts }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Ảnh</h2>
                <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-semibold text-[15px]">Xem tất cả ảnh</button>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden min-h-[100px]">
                {posts.filter(p => p.imageUrl && ['normal', 'profile_update', 'cover_update'].includes(p.type)).slice(0, 9).length > 0 ? (
                    posts.filter(p => p.imageUrl && ['normal', 'profile_update', 'cover_update'].includes(p.type)).slice(0, 9).map((post, i) => (
                        <img key={i} src={post.imageUrl} className="h-28 w-full object-cover hover:opacity-90 cursor-pointer shadow-sm border" alt="" />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-4 text-gray-500 text-sm">Chưa có ảnh nào</div>
                )}
            </div>
        </div>
    );
};

export default ProfilePhotos;
