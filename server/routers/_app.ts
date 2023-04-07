import { addSongToPlaylistProcedure } from './playlistSongManagementProcedures';
import { router } from '../trpc';
import { listUserPlaylistsProcedure, newPlaylistProcedure } from './playlistManagementProcedures';
import { searchTracksProcedure } from './searchProcedures';
import { meProcedure } from './spotifyProcedures';
export const appRouter = router({
    spotifyMe: meProcedure,
    // spotifySearchTracks: searchTracksProcedure,
    searchTracks: searchTracksProcedure,
    newPlaylist: newPlaylistProcedure,
    listPlaylists: listUserPlaylistsProcedure,
    addSongToPlaylist: addSongToPlaylistProcedure
});
// export type definition of API
export type AppRouter = typeof appRouter;