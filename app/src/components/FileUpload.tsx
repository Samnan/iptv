import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  isLoading: boolean;
}

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.m3u')) {
      alert('Please select a valid .m3u file');
      return;
    }

    try {
      const content = await file.text();
      onFileUpload(content, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
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
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-8 h-8 text-blue-500" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Upload M3U Playlist
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Select your .m3u playlist file to get started
          </p>
          
          <button
            onClick={handleClick}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isLoading ? 'Processing...' : 'Choose File'}
          </button>
        </div>
      </div>
    </div>
  );
}