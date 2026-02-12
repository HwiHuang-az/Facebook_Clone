import React, { useRef, useState, useEffect } from 'react';
import {
    PlayIcon,
    PauseIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from '@heroicons/react/24/solid';

const VideoPlayer = ({ src, className = '', autoPlay = false, onViewTracked }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [hasTrackedView, setHasTrackedView] = useState(false);
    const hideControlsTimeout = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);

            // Track view when user watches 3+ seconds
            if (!hasTrackedView && video.currentTime >= 3 && onViewTracked) {
                setHasTrackedView(true);
                onViewTracked();
            }
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const percentage = (bufferedEnd / video.duration) * 100;
                setBuffered(percentage);
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [hasTrackedView, onViewTracked]);

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => {
                // Auto-play was prevented
            });
        }
    }, [autoPlay]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleSeek = (e) => {
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        if (newVolume > 0) {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const changePlaybackRate = () => {
        const rates = [0.5, 1, 1.5, 2];
        const currentIndex = rates.indexOf(playbackRate);
        const nextRate = rates[(currentIndex + 1) % rates.length];
        setPlaybackRate(nextRate);
        if (videoRef.current) {
            videoRef.current.playbackRate = nextRate;
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        hideControlsTimeout.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    const handleKeyPress = (e) => {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'm':
                toggleMute();
                break;
            case 'ArrowRight':
                if (videoRef.current) {
                    videoRef.current.currentTime += 5;
                }
                break;
            case 'ArrowLeft':
                if (videoRef.current) {
                    videoRef.current.currentTime -= 5;
                }
                break;
            default:
                break;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative bg-black group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onKeyDown={handleKeyPress}
            tabIndex={0}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                onClick={togglePlay}
            />

            {/* Controls Overlay */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Center Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                        {isPlaying ? (
                            <PauseIcon className="h-8 w-8 text-white" />
                        ) : (
                            <PlayIcon className="h-8 w-8 text-white ml-1" />
                        )}
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    {/* Progress Bar */}
                    <div
                        ref={progressBarRef}
                        className="w-full h-1 bg-white/30 rounded-full cursor-pointer group/progress"
                        onClick={handleSeek}
                    >
                        {/* Buffered */}
                        <div
                            className="absolute h-1 bg-white/50 rounded-full"
                            style={{ width: `${buffered}%` }}
                        />
                        {/* Progress */}
                        <div
                            className="relative h-1 bg-blue-500 rounded-full group-hover/progress:h-1.5 transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100" />
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="hover:scale-110 transition-transform"
                            >
                                {isPlaying ? (
                                    <PauseIcon className="h-6 w-6" />
                                ) : (
                                    <PlayIcon className="h-6 w-6" />
                                )}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center space-x-2 group/volume">
                                <button onClick={toggleMute} className="hover:scale-110 transition-transform">
                                    {isMuted || volume === 0 ? (
                                        <SpeakerXMarkIcon className="h-6 w-6" />
                                    ) : (
                                        <SpeakerWaveIcon className="h-6 w-6" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
                                />
                            </div>

                            {/* Time */}
                            <span className="text-sm font-medium">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Playback Speed */}
                            <button
                                onClick={changePlaybackRate}
                                className="text-sm font-medium px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                            >
                                {playbackRate}x
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="hover:scale-110 transition-transform"
                            >
                                {isFullscreen ? (
                                    <ArrowsPointingInIcon className="h-6 w-6" />
                                ) : (
                                    <ArrowsPointingOutIcon className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
