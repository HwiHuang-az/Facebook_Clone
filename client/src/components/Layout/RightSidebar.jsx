import React from 'react';
import {
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  PlusIcon
} from '@heroicons/react/24/solid';

const RightSidebar = () => {
  // Sample contacts data
  const contacts = [
    { id: 1, name: 'Meta AI', icon: '🔵', isMeta: true, online: true },
    { id: 2, name: 'Nguyễn Huy Hoàng', image: 'https://ui-avatars.com/api/?name=Nguyen+Huy+Hoang&background=random', online: true, time: '36 phút' },
    { id: 3, name: 'Ly Lê', image: 'https://ui-avatars.com/api/?name=Ly+Le&background=random', online: true, time: '6 phút' },
    { id: 4, name: 'Trần Văn A', image: 'https://ui-avatars.com/api/?name=Tran+Van+A&background=random', online: false },
    { id: 5, name: 'Phạm Thị B', image: 'https://ui-avatars.com/api/?name=Pham+Thi+B&background=random', online: false },
  ];

  return (
    <aside className="hidden lg:block w-full sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
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
