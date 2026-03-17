import React, { useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import { useFriendships } from '../../hooks/useFriendships';
import { useSocket } from '../../hooks/useSocket';
import api from '../../utils/api';

const RightSidebar = () => {
  const { friends, getFriends, loading } = useFriendships();
  const { onlineUsers } = useSocket();
  const [ads, setAds] = React.useState([]);

  useEffect(() => {
    getFriends(1, 10); // Lấy 10 người bạn đầu tiên
    fetchAds();
  }, [getFriends]);

  const fetchAds = async () => {
    try {
      const { data } = await api.get('/ads');
      if (data.success) {
        setAds(data.data);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  // Map backend friends to contacts format
  const contacts = friends.map(f => ({
    id: f.friend.id,
    name: `${f.friend.firstName} ${f.friend.lastName}`,
    image: f.friend.profilePicture || `https://ui-avatars.com/api/?name=${f.friend.firstName}+${f.friend.lastName}&background=random`,
    online: onlineUsers.has(f.friend.id),
  }));

  if (loading && contacts.length === 0) {
    return (
      <aside className="hidden lg:block w-full sticky top-24 max-h-[calc(100vh-6rem)] pr-2">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-full sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
      {/* Sponsored Section */}
      {ads.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-[17px] text-gray-500 mb-2 px-2">Được tài trợ</h3>
          <ul className="space-y-2">
            {ads.map((ad) => (
              <li key={ad.id}>
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors group"
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.sponsorName}
                    className="w-[110px] h-[110px] rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-gray-900 group-hover:underline line-clamp-2">
                      {ad.title}
                    </p>
                    <p className="text-[13px] text-gray-500 truncate">{ad.sponsorName}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-300 my-3"></div>
        </div>
      )}

      {/* Contacts Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 text-gray-500">
          <h3 className="font-semibold text-[17px]">Người liên hệ</h3>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ul className="space-y-1">
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors group relative"
            >
              <div className="relative shrink-0">
                {contact.isMeta ? (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600"></div>
                    </div>
                    <div className="absolute bottom-0 right-0 p-0.5 bg-white rounded-full">
                      <div className="bg-blue-500 text-white text-[8px] p-0.5 rounded-full">✔</div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={contact.image}
                      alt={contact.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    {contact.time && (
                      <div className="absolute -bottom-1 -right-1 bg-green-100 text-green-800 text-[10px] font-bold px-1 rounded-full border border-white hidden">
                        {contact.time}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-gray-900 truncate">
                  {contact.name}
                </p>
                {contact.time && (
                  <p className="text-[11px] text-green-600 font-bold">{contact.time}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-300 my-2"></div>

      {/* Group Chat Section */}
      <div className="mb-4">
        <h3 className="font-semibold text-[17px] text-gray-500 mb-2">Nhóm chat</h3>
        <button className="w-full flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-left">
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 shrink-0">
            <PlusIcon className="h-5 w-5" />
          </div>
          <p className="text-[15px] font-medium text-gray-900">Tạo nhóm chat</p>
        </button>
      </div>
    </aside>
  );
};

export default RightSidebar;
