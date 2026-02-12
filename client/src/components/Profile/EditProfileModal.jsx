import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { VIETNAM_UNIVERSITIES } from '../../utils/universities';
import { COMPANIES } from '../../utils/companies';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        work: user.work || '',
        education: user.education || '',
        relationshipStatus: user.relationshipStatus || 'Độc thân',
    });
    const [provinces, setProvinces] = useState([]);
    const [universities] = useState(VIETNAM_UNIVERSITIES);
    const [filteredUnis, setFilteredUnis] = useState([]);
    const [showUniDropdown, setShowUniDropdown] = useState(false);

    const [companyList] = useState(COMPANIES);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetchLoading] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://provinces.open-api.vn/api/?depth=1');
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error('Fetch provinces error:', error);
            }
        };

        fetchProvinces();
    }, []);

    const handleUniSearch = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, education: value });

        if (value.length > 1) {
            const filtered = universities.filter(u =>
                u.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredUnis(filtered.slice(0, 8)); // Giới hạn 8 kết quả
            setShowUniDropdown(true);
        } else {
            setShowUniDropdown(false);
        }
    };

    const selectUni = (uniName) => {
        setFormData({ ...formData, education: uniName });
        setShowUniDropdown(false);
    };

    const handleCompanySearch = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, work: value });

        if (value.length > 0) {
            const filtered = companyList.filter(c =>
                c.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCompanies(filtered.slice(0, 8));
            setShowCompanyDropdown(true);
        } else {
            setShowCompanyDropdown(false);
        }
    };

    const selectCompany = (companyName) => {
        setFormData({ ...formData, work: companyName });
        setShowCompanyDropdown(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.put('/users/profile', formData);
            if (res.data.success) {
                toast.success('Cập nhật thành công');
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top duration-300">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-center flex-1">Chỉnh sửa trang cá nhân</h2>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Họ</label>
                            <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tên</label>
                            <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tiểu sử</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" placeholder="Mô tả về bản thân..." />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-1">🏢 Công việc</label>
                        <input
                            name="work"
                            value={formData.work}
                            onChange={handleCompanySearch}
                            onFocus={() => { if (formData.work.length > 0) setShowCompanyDropdown(true) }}
                            className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Làm việc tại..."
                            autoComplete="off"
                        />
                        {showCompanyDropdown && filteredCompanies.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-200">
                                {filteredCompanies.map((company, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectCompany(company)}
                                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0 transition-colors"
                                    >
                                        🏢 {company}
                                    </div>
                                ))}
                            </div>
                        )}
                        {showCompanyDropdown && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowCompanyDropdown(false)}></div>
                        )}
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-1">🎓 Học vấn</label>
                        <input
                            name="education"
                            value={formData.education}
                            onChange={handleUniSearch}
                            onFocus={() => { if (formData.education.length > 1) setShowUniDropdown(true) }}
                            className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Học tại (vd: Đại học Quốc gia...)"
                            autoComplete="off"
                        />
                        {showUniDropdown && filteredUnis.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-200">
                                {filteredUnis.map((uni, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectUni(uni)}
                                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0 transition-colors"
                                    >
                                        🏫 {uni}
                                    </div>
                                ))}
                            </div>
                        )}
                        {fetchLoading && formData.education.length > 1 && (
                            <div className="absolute right-3 top-9 text-xs text-gray-400">Đang tải...</div>
                        )}
                        {showUniDropdown && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowUniDropdown(false)}></div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">📍 Tỉnh/Thành phố hiện tại</label>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">Chọn Tỉnh/Thành phố...</option>
                            {provinces.map(p => (
                                <option key={p.code} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">💞 Tình trạng mối quan hệ</label>
                        <select name="relationshipStatus" value={formData.relationshipStatus} onChange={handleChange} className="w-full bg-gray-50 p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                            <option value="Độc thân">Độc thân</option>
                            <option value="Hẹn hò">Hẹn hò</option>
                            <option value="Đã kết hôn">Đã kết hôn</option>
                            <option value="Phức tạp">Phức tạp</option>
                        </select>
                    </div>
                    <div className="pt-6 flex space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Hủy</button>
                        <button type="submit" disabled={loading} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
