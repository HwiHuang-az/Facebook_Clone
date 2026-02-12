import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Comment = ({ comment }) => {
    return (
        <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 mt-1">
                {comment.author.profilePicture ? (
                    <img
                        src={comment.author.profilePicture}
                        alt={comment.author.lastName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                        {comment.author.firstName.charAt(0)}
                    </span>
                )}
            </div>
            <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <h4 className="font-bold text-sm text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                    </h4>
                    <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-1 ml-2 text-xs font-bold text-gray-500">
                    <button className="hover:underline">Thích</button>
                    <button className="hover:underline">Trả lời</button>
                    <span className="font-normal">
                        {comment.createdAt ? (
                            (() => {
                                const date = new Date(comment.createdAt);
                                return isNaN(date.getTime())
                                    ? 'Vừa xong'
                                    : formatDistanceToNow(date, { addSuffix: true, locale: vi });
                            })()
                        ) : 'Vừa xong'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Comment;
