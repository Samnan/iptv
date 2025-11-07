import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, RotateCcw } from 'lucide-react';
import { Channel } from '../types/Channel';
import Hls from 'hls.js';

interface VideoPlayerProps {
  channel: Channel | null;
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    return () => {
      // Cleanup HLS instance on unmount
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setHasError(false);
    setIsLoading(true);
    setErrorMessage('');

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const loadStream = () => {
      const url = channel.url;
      
      // Check if it's an HLS stream (.m3u8) or if HLS.js is supported
      if (url.includes('.m3u8') || url.includes('m3u8')) {
        if (Hls.isSupported()) {
          // Use HLS.js for HLS streams
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });
          
          hlsRef.current = hls;
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              setHasError(true);
              setIsLoading(false);
              setErrorMessage(`Stream error: ${data.details || 'Unknown error'}`);
            }
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            video.play().catch((error) => {
              console.error('Play error:', error);
              setHasError(true);
              setErrorMessage('Failed to start playback');
            });
          });

          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = url;
          video.load();
        } else {
          setHasError(true);
          setIsLoading(false);
          setErrorMessage('HLS streams not supported in this browser');
        }
      } else {
        // Direct video stream
        video.src = url;
        video.load();
      }
    };

    loadStream();
  }, [channel]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.error('Play error:', error);
          setHasError(true);
          setErrorMessage('Failed to start playback');
        });
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen().catch(console.error);
    }
  };

  const handleRetry = () => {
    if (!channel) return;
    
    setHasError(false);
    setIsLoading(true);
    setErrorMessage('');
    
    // Cleanup and reload
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.load();
    }
    
    // Trigger reload by updating the effect
    const event = new CustomEvent('retry');
    videoRef.current?.dispatchEvent(event);
  };

  if (!channel) {
    return (
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Play className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Channel Selected</h3>
          <p className="text-gray-500">Select a channel from the sidebar to start streaming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black flex flex-col">
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onPlay={() => {
            setIsPlaying(true);
            setIsLoading(false);
          }}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Video error:', e);
            setHasError(true);
            setIsLoading(false);
            setErrorMessage('Failed to load video stream');
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          controls={false}
          muted={isMuted}
          playsInline
          crossOrigin="anonymous"
        />

        {hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white max-w-md mx-auto p-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Stream Error</h3>
              <p className="text-gray-300 mb-2">Unable to load the stream for this channel</p>
              {errorMessage && (
                <p className="text-sm text-gray-400 mb-4">{errorMessage}</p>
              )}
              <div className="space-y-2">
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <p className="text-xs text-gray-500">
                  Some streams may require CORS headers or may be geo-restricted
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading stream...</p>
              <p className="text-sm text-gray-300 mt-2">{channel.name}</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlayPause}
              disabled={hasError}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            
            <button
              onClick={handleMuteToggle}
              disabled={hasError}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            <div className="text-white">
              <h4 className="font-medium">{channel.name}</h4>
              <p className="text-sm text-gray-300">{channel.group}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRetry}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-colors"
              title="Retry stream"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleFullscreen}
              disabled={hasError}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}