export type ArchivePlaylist = {
  title: string
  url: string
  special?: string
  timeslot?: string
  date: Date
}

export type PlaylistTrack = {
  artist: string
  song: string
  label?: string
  timeslot?: string
  countdown?: number
}

export type Playlist = {
  title: string
  special?: string
  timeslot?: string
  date: string
  url: string
  tracks: PlaylistTrack[]
}

export type IndexedPlaylist = {
  special?: string
  timeslot?: string
  date: string
  path: string
  url?: string
}

export type DataIndex = {
  playlists: IndexedPlaylist[]
}