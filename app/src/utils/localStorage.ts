import { Channel } from '../types/Channel';

export interface SavedChannelList {
  id: string;
  name: string;
  channels: Channel[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'iptv_channel_lists';
const CURRENT_LIST_KEY = 'iptv_current_list_id';

/**
 * Get all saved channel lists from local storage
 */
export function getAllSavedLists(): SavedChannelList[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return [];
  }
}

/**
 * Save a channel list to local storage
 */
export function saveChannelList(name: string, channels: Channel[]): string {
  const lists = getAllSavedLists();
  const id = crypto.randomUUID();
  const now = Date.now();
  
  const newList: SavedChannelList = {
    id,
    name,
    channels: channels.map(ch => ({ ...ch })), // Deep copy
    createdAt: now,
    updatedAt: now
  };
  
  lists.push(newList);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  
  return id;
}

/**
 * Update an existing channel list
 */
export function updateChannelList(listId: string, channels: Channel[]): boolean {
  const lists = getAllSavedLists();
  const listIndex = lists.findIndex(list => list.id === listId);
  
  if (listIndex === -1) return false;
  
  lists[listIndex].channels = channels.map(ch => ({ ...ch })); // Deep copy
  lists[listIndex].updatedAt = Date.now();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  return true;
}

/**
 * Get a specific channel list by ID
 */
export function getChannelList(listId: string): SavedChannelList | null {
  const lists = getAllSavedLists();
  return lists.find(list => list.id === listId) || null;
}

/**
 * Delete a channel list
 */
export function deleteChannelList(listId: string): boolean {
  const lists = getAllSavedLists();
  const filtered = lists.filter(list => list.id !== listId);
  
  if (filtered.length === lists.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get the current active list ID
 */
export function getCurrentListId(): string | null {
  return localStorage.getItem(CURRENT_LIST_KEY);
}

/**
 * Set the current active list ID
 */
export function setCurrentListId(listId: string | null): void {
  if (listId) {
    localStorage.setItem(CURRENT_LIST_KEY, listId);
  } else {
    localStorage.removeItem(CURRENT_LIST_KEY);
  }
}

