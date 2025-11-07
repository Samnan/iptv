import { Channel, ParsedM3U } from '../types/Channel';

export function parseM3U(content: string): ParsedM3U {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const channels: Channel[] = [];
  
  let currentChannel: Partial<Channel> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF line: #EXTINF:-1 tvg-id="channel1" tvg-name="Channel Name" tvg-logo="logo.png" group-title="Group",Display Name
      const extinf = line.substring(8); // Remove #EXTINF:
      
      // Extract channel name (after the last comma)
      const lastCommaIndex = extinf.lastIndexOf(',');
      const channelName = lastCommaIndex !== -1 ? extinf.substring(lastCommaIndex + 1).trim() : 'Unknown Channel';
      
      // Extract attributes
      const attributes = extinf.substring(0, lastCommaIndex !== -1 ? lastCommaIndex : extinf.length);
      const logoMatch = attributes.match(/tvg-logo="([^"]+)"/);
      const groupMatch = attributes.match(/group-title="([^"]+)"/);
      
      currentChannel = {
        id: crypto.randomUUID(),
        name: channelName,
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : 'Uncategorized',
        isFavorite: false
      };
    } else if (line.startsWith('http')) {
      // This is a URL line
      if (currentChannel.name) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  }
  
  return {
    channels,
    totalChannels: channels.length
  };
}

export function generateM3U(channels: Channel[]): string {
  let content = '#EXTM3U\n\n';
  
  channels.forEach(channel => {
    const logo = channel.logo ? ` tvg-logo="${channel.logo}"` : '';
    const group = channel.group ? ` group-title="${channel.group}"` : '';
    
    content += `#EXTINF:-1${logo}${group},${channel.name}\n`;
    content += `${channel.url}\n\n`;
  });
  
  return content;
}

export function downloadM3U(content: string, filename: string = 'favorites.m3u') {
  const blob = new Blob([content], { type: 'audio/x-mpegurl' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}