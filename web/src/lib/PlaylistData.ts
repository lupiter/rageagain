import { DataIndex, Playlist } from "../Types"

//const baseUrl = 'http://localhost:8787/api/data/' // Default local dev url of ../api project
const baseUrl = 'https://api.ragereplay.com/api/data/' // Must have trailing slash

let dataIndex: DataIndex = {
  playlists: []
}

export const getPlaylistIndex = async (): Promise<DataIndex> => {
  if (dataIndex.playlists.length) {
    return Promise.resolve(dataIndex)
  }

  const response = await fetch(baseUrl + 'index.json');

  if (!response.ok) {
    throw new Error(`Failed to load playlist index: ${response.statusText}`);
  }

  const data = await response.json() as DataIndex;

  dataIndex = data;

  return data;
}


export const getPlaylist = async (path: string): Promise<Playlist> => {
  const response = await fetch(baseUrl + path);

  if (!response.ok) {
    throw new Error(`Failed to load playlist ${path}: ${response.statusText}`);
  }

  const data = await response.json() as Playlist;

  return data;
}