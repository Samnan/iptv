import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChannelList } from './components/ChannelList';
import { VideoPlayer } from './components/VideoPlayer';
import { Channel, ParsedM3U } from './types/Channel';
import { parseM3U, generateM3U, downloadM3U } from './utils/m3uParser';
import { Tv, Menu, X } from 'lucide-react';

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleFileUpload = async (content: string, filename: string) => {
    setIsLoading(true);
    try {
      const parsed: ParsedM3U = parseM3U(content);
      setChannels(parsed.channels);
      if (parsed.channels.length > 0) {
        setSelectedChannel(parsed.channels[0]);
      }
    } catch (error) {
      console.error('Error parsing M3U file:', error);
      alert('Error parsing M3U file. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleToggleFavorite = (channelId: string) => {
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, isFavorite: !channel.isFavorite }
          : channel
      )
    );
  };

  const handleDeleteChannel = (channelId: string) => {
    setChannels(prev => prev.filter(channel => channel.id !== channelId));
    if (selectedChannel?.id === channelId) {
      const remainingChannels = channels.filter(channel => channel.id !== channelId);
      setSelectedChannel(remainingChannels.length > 0 ? remainingChannels[0] : null);
    }
  };

  const handleExportFavorites = () => {
    const favoriteChannels = channels.filter(channel => channel.isFavorite);
    if (favoriteChannels.length === 0) {
      alert('No favorite channels to export');
      return;
    }
    
    const m3uContent = generateM3U(favoriteChannels);
    downloadM3U(m3uContent, 'favorites.m3u');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">IPTV Player</h1>
            </div>
          </div>
          
          {channels.length > 0 && (
            <div className="text-sm text-gray-500">
              {selectedChannel ? `Now Playing: ${selectedChannel.name}` : 'Select a channel'}
            </div>
          )}
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {channels.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full">
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <>
            <div className={`transition-all duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } fixed lg:relative z-20 lg:z-0`}>
              <ChannelList
                channels={channels}
                selectedChannel={selectedChannel}
                onChannelSelect={handleChannelSelect}
                onToggleFavorite={handleToggleFavorite}
                onDeleteChannel={handleDeleteChannel}
                onExportFavorites={handleExportFavorites}
              />
            </div>
            
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            <VideoPlayer channel={selectedChannel} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;