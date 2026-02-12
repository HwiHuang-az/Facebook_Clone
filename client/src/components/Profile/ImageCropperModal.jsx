import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../../utils/imageUtils';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

const ImageCropperModal = ({ imageSrc, type, onClose, onCropComplete }) => {
    const [crop, setCrop] = useState();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState(type === 'profile' ? 1 : 1012 / 385); // Facebook cover ratio approx
    const imgRef = useRef(null);

    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    const handleDone = async () => {
        if (imgRef.current && crop.width && crop.height) {
            try {
                const croppedBlob = await getCroppedImg(
                    imgRef.current,
                    crop,
                    'cropped-image.jpg',
                    scale,
                    rotate
                );
                onCropComplete(croppedBlob);
            } catch (e) {
                console.error('Crop error:', e);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        Cắt ảnh {type === 'profile' ? 'đại diện' : 'bìa'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">✕</button>
                </div>

                <div className="p-8 bg-gray-50 flex flex-col items-center">
                    <div className="max-w-full overflow-hidden rounded-lg shadow-inner bg-gray-200">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            aspect={aspect}
                            circularCrop={type === 'profile'}
                            className="max-w-full"
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imageSrc}
                                onLoad={onImageLoad}
                                style={{
                                    maxHeight: '50vh',
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                }}
                            />
                        </ReactCrop>
                    </div>

                    {/* Controls */}
                    <div className="mt-8 w-full max-w-sm space-y-6">
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-500">➖</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={scale}
                                onChange={(e) => setScale(Number(e.target.value))}
                                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-gray-500">➕</span>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setRotate((r) => (r + 90) % 360)}
                                className="text-gray-600 hover:text-blue-600 font-medium flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <span>🔄</span>
                                <span>Xoay ảnh</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex justify-end space-x-3 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-8 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDone}
                        className="px-8 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
