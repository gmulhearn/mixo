import { addSongToPlaylistProcedure, getFullPlaylistByIdProcedure } from './playlistSongManagementProcedures';
import { router } from '../trpc';
import { deletePlaylistProcedure, listUserPlaylistsProcedure, newPlaylistProcedure } from './playlistManagementProcedures';
import { searchTracksProcedure } from './searchProcedures';
import { getAccessTokenProcedure, meProcedure } from './spotifyProcedures';

export const appRouter = router({
    spotifyMe: meProcedure,
    getAccessToken: getAccessTokenProcedure,
    searchTracks: searchTracksProcedure,
    newPlaylist: newPlaylistProcedure,
    listPlaylists: listUserPlaylistsProcedure,
    deletePlaylist: deletePlaylistProcedure,
    addSongToPlaylist: addSongToPlaylistProcedure,
    getFullPlaylistById: getFullPlaylistByIdProcedure,
});
// export type definition of API
export type AppRouter = typeof appRouter;