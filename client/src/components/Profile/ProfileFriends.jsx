import React from 'react';

const ProfileFriends = ({ friends, friendsCount, setActiveTab }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold">Bạn bè</h2>
                    <span className="text-gray-500 text-[15px]">{friendsCount || 0} người bạn</span>
                </div>
                <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-semibold text-[15px]">Xem tất cả bạn bè</button>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                {friends.slice(0, 9).map((friend) => (
                    <div
                        key={friend.id}
                        onClick={() => { setActiveTab('posts'); window.location.href = `/profile/${friend.id}` }}
                        className="cursor-pointer group"
                    >
                        <img
                            src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}&background=2563EB&color=fff`}
                            className="h-28 w-full object-cover rounded-lg group-hover:opacity-90 shadow-sm"
                            alt=""
                        />
                        <p className="text-[13px] font-bold mt-1 truncate">{friend.firstName} {friend.lastName}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileFriends;
