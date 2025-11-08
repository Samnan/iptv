import { Heart, Trash2, Play, Users, Star, Search } from 'lucide-react';
import { Channel } from '../types/Channel';

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onDeleteChannel: (channelId: string) => void;
  onExportFavorites: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChannelList({ 
  channels, 
  selectedChannel, 
  onChannelSelect, 
  onToggleFavorite, 
  onDeleteChannel,
  onExportFavorites,
  searchQuery,
  onSearchChange
}: ChannelListProps) {
  const favoriteChannels = channels.filter(channel => channel.isFavorite);
  const groupedChannels = channels.reduce((acc, channel) => {
    const group = channel.group || 'Uncategorized';
    if (!acc[group]) acc[group] = [];
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Channels</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {channels.length} total
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onExportFavorites}
            disabled={favoriteChannels.length === 0}
            className="w-1/2 flex items-center justify-center px-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Star className="w-4 h-4 mr-1" />
            <span className="truncate">Export ({favoriteChannels.length})</span>
          </button>
          
          <div className="w-1/2 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search channels..."
              className="w-full pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedChannels).map(([group, groupChannels]) => (
          <div key={group} className="mb-4">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center text-sm font-medium text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {group} ({groupChannels.length})
              </div>
            </div>
            
            {groupChannels.map((channel) => (
              <div
                key={channel.id}
                className={`p-3 border-b border-gray-100 ${selectedChannel?.id === channel.id ? 'hover:bg-blue-600' : 'hover:bg-gray-50'} transition-colors ${
                  selectedChannel?.id === channel.id 
                    ? 'bg-blue-600 border-l-4 border-l-blue-800 text-blue-50'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onChannelSelect(channel)}
                    className="flex-1 flex items-center space-x-3 text-left group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Play className={`w-5 h-5 text-white ${channel.logo ? 'hidden' : ''}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium {selectedChannel?.id === channel.id ? 'text-blue-50' : 'text-gray-800'} truncate  transition-colors">
                        {channel.name}
                      </h3>
                      <p className="text-xs {selectedChannel?.id === channel.id ? 'text-blue-50' : 'text-gray-500'} truncate">
                        {new URL(channel.url).hostname}
                      </p>
                    </div>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onToggleFavorite(channel.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        channel.isFavorite 
                          ? 'text-red-500 hover:bg-red-50' 
                          : selectedChannel?.id === channel.id ? 'text-blue-50 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'}
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${channel.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteChannel(channel.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}