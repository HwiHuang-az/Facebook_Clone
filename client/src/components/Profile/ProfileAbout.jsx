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
import { PencilIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

const ProfileAbout = ({ user: initialUser, aboutSubTab, setAboutSubTab, isOwnProfile }) => {
    const [user, setUser] = useState(initialUser);
    const [editingField, setEditingField] = useState(null); // 'work', 'education', 'location', 'relationshipStatus'
    const [tempValue, setTempValue] = useState('');
    const [saving, setSaving] = useState(false);

    const handleEdit = (field, value) => {
        setEditingField(field);
        setTempValue(value || '');
    };

    const handleCancel = () => {
        setEditingField(null);
        setTempValue('');
    };

    const handleSave = async (field) => {
        setSaving(true);
        try {
            const res = await api.put('/users/profile', {
                [field]: tempValue,
                // Gửi kèm firstName, lastName vì backend hiện tại có thể yêu cầu (đã check lại logic partial update)
                firstName: user.firstName,
                lastName: user.lastName
            });

            if (res.data.success) {
                setUser(res.data.data.user);
                setEditingField(null);
                toast.success('Đã cập nhật thông tin');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const EditButton = ({ field, value }) => isOwnProfile && !editingField && (
        <button
            onClick={() => handleEdit(field, value)}
            className="text-facebook-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
            <PencilIcon className="h-5 w-5" />
        </button>
    );

    const AddLink = ({ field, label }) => isOwnProfile && !editingField && (
        <button
            onClick={() => handleEdit(field, '')}
            className="flex items-center space-x-2 text-facebook-600 hover:underline font-semibold"
        >
            <PlusIcon className="h-5 w-5" />
            <span>Thêm {label}</span>
        </button>
    );

    const EditForm = ({ field, label }) => (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="font-bold text-sm text-gray-700">{label}</p>
            {field === 'relationshipStatus' ? (
                <select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                >
                    <option value="single">Độc thân</option>
                    <option value="in_relationship">Đang hẹn hò</option>
                    <option value="married">Đã kết hôn</option>
                    <option value="complicated">Mối quan hệ phức tạp</option>
                </select>
            ) : (
                <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    autoFocus
                />
            )}
            <div className="flex items-center space-x-2 justify-end">
                <button
                    onClick={handleCancel}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
                    disabled={saving}
                >
                    Hủy
                </button>
                <button
                    onClick={() => handleSave(field)}
                    className="px-4 py-1.5 bg-facebook-600 text-white rounded-lg text-sm font-bold hover:bg-facebook-700 transition-colors disabled:opacity-50"
                    disabled={saving}
                >
                    {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </div>
    );
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
                                {editingField === 'work' ? (
                                    <EditForm field="work" label="Nơi làm việc" />
                                ) : user?.work ? (
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <BriefcaseIcon className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <p className="font-bold">{user.work}</p>
                                                <p className="text-sm text-gray-500">Nhân viên</p>
                                            </div>
                                        </div>
                                        <EditButton field="work" value={user.work} />
                                    </div>
                                ) : (
                                    <AddLink field="work" label="nơi làm việc" />
                                )}
                            </div>
                            <div>
                                <p className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">Học vấn</p>
                                {editingField === 'education' ? (
                                    <EditForm field="education" label="Trường học" />
                                ) : user?.education ? (
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <AcademicCapIcon className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <p className="font-bold">{user.education}</p>
                                                <p className="text-sm text-gray-500">Sinh viên</p>
                                            </div>
                                        </div>
                                        <EditButton field="education" value={user.education} />
                                    </div>
                                ) : (
                                    <AddLink field="education" label="trường học" />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {aboutSubTab === 'places' && (
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-bold">Nơi từng sống</h3>
                        <div className="space-y-4">
                            {editingField === 'location' ? (
                                <EditForm field="location" label="Tỉnh/Thành phố hiện tại" />
                            ) : user?.location ? (
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-3">
                                        <HomeIcon className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <p className="font-bold">{user.location}</p>
                                            <p className="text-sm text-gray-500">Tỉnh/Thành phố hiện tại</p>
                                        </div>
                                    </div>
                                    <EditButton field="location" value={user.location} />
                                </div>
                            ) : (
                                <AddLink field="location" label="tỉnh/thành phố hiện tại" />
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
                            {editingField === 'relationshipStatus' ? (
                                <EditForm field="relationshipStatus" label="Tình trạng mối quan hệ" />
                            ) : (
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-3">
                                        <HeartIcon className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <p className="font-bold">
                                                {user?.relationshipStatus === 'single' ? 'Độc thân' : 
                                                 user?.relationshipStatus === 'in_relationship' ? 'Đang hẹn hò' : 
                                                 user?.relationshipStatus === 'married' ? 'Đã kết hôn' : 
                                                 user?.relationshipStatus === 'complicated' ? 'Mối quan hệ phức tạp' : 'Độc thân'}
                                            </p>
                                            <p className="text-sm text-gray-500">Tình trạng mối quan hệ</p>
                                        </div>
                                    </div>
                                    <EditButton field="relationshipStatus" value={user?.relationshipStatus || 'single'} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileAbout;
