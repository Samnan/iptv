import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChannelList } from './components/ChannelList';
import { VideoPlayer } from './components/VideoPlayer';
import { Channel, ParsedM3U } from './types/Channel';
import { parseM3U, generateM3U, downloadM3U } from './utils/m3uParser';
import { 
  getAllSavedLists, 
  saveChannelList, 
  updateChannelList, 
  getChannelList,
  getCurrentListId,
  setCurrentListId,
  SavedChannelList 
} from './utils/localStorage';
import { Tv, Menu, X } from 'lucide-react';

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentListId, setCurrentListIdState] = useState<string | null>(null);
  const [savedLists, setSavedLists] = useState<SavedChannelList[]>([]);

  // Load saved lists and current list on mount
  useEffect(() => {
    const lists = getAllSavedLists();
    setSavedLists(lists);
    
    const savedCurrentListId = getCurrentListId();
    if (savedCurrentListId) {
      const currentList = getChannelList(savedCurrentListId);
      if (currentList) {
        setChannels(currentList.channels);
        setCurrentListIdState(savedCurrentListId);
        if (currentList.channels.length > 0) {
          setSelectedChannel(currentList.channels[0]);
        }
      }
    }
  }, []);

  // Save channels to local storage whenever they change
  useEffect(() => {
    if (currentListId && channels.length > 0) {
      updateChannelList(currentListId, channels);
      setSavedLists(getAllSavedLists());
    }
  }, [channels, currentListId]);

  const handleFileUpload = async (content: string, filename: string) => {
    setIsLoading(true);
    try {
      const parsed: ParsedM3U = parseM3U(content);
      const listName = filename.replace('.m3u', '') || 'Untitled Playlist';
      const listId = saveChannelList(listName, parsed.channels);
      
      setChannels(parsed.channels);
      setCurrentListIdState(listId);
      setCurrentListId(listId);
      setSavedLists(getAllSavedLists());
      
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
    setChannels(prev => {
      const updated = prev.filter(channel => channel.id !== channelId);
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  const handleListSelect = (listId: string) => {
    if (!listId) {
      // Clear current list and show upload screen
      setChannels([]);
      setSelectedChannel(null);
      setCurrentListIdState(null);
      setCurrentListId(null);
      return;
    }
    
    const selectedList = getChannelList(listId);
    if (selectedList) {
      setChannels(selectedList.channels);
      setCurrentListIdState(listId);
      setCurrentListId(listId);
      if (selectedList.channels.length > 0) {
        setSelectedChannel(selectedList.channels[0]);
      } else {
        setSelectedChannel(null);
      }
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
          
          <div className="flex items-center space-x-4">
            {savedLists.length > 0 && (
              <select
                value={currentListId || ''}
                onChange={(e) => handleListSelect(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
              >
                <option value="">Select a playlist...</option>
                {savedLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.channels.length} channels)
                  </option>
                ))}
              </select>
            )}
            
            {channels.length > 0 && (
              <>
                <button
                  onClick={() => {
                    setChannels([]);
                    setSelectedChannel(null);
                    setCurrentListIdState(null);
                    setCurrentListId(null);
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload New
                </button>
                <div className="text-sm text-gray-500">
                  {selectedChannel ? `Now Playing: ${selectedChannel.name}` : 'Select a channel'}
                </div>
              </>
            )}
          </div>
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