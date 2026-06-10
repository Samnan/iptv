import React, { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  isLoading: boolean;
}

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const isBusy = isLoading || isUrlLoading;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.m3u')) {
      alert('Please select a valid .m3u file');
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const content = await file.text();
      onFileUpload(content, file.name);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
      // Reset input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      alert('Please enter a playlist URL');
      return;
    }

    setIsUrlLoading(true);
    try {
      const response = await fetch(trimmedUrl);
      if (!response.ok) {
        throw new Error(`Failed to load URL: ${response.status}`);
      }
      const content = await response.text();
      onFileUpload(content, trimmedUrl);
      setUrl('');
    } catch (error) {
      console.error('Error loading playlist URL:', error);
      alert('Error loading playlist from URL. Please check the address and try again.');
    } finally {
      setIsUrlLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept=".m3u"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          {isBusy ? (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-8 h-8 text-blue-500" />
          )}
        </div>
        
        <div className="w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Upload M3U Playlist
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Select your .m3u playlist file or load a playlist from a web URL.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleClick}
                disabled={isBusy}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isBusy ? 'Processing...' : 'Choose File'}
              </button>
              <p className="text-xs text-gray-500">Upload a local .m3u file from your device.</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Or load from a web URL</p>
              <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isBusy}
                />
                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUrlLoading ? 'Loading...' : 'Load from URL'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}