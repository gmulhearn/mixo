import { z } from "zod";
import { procedure } from "../trpc";
import * as spotifyAPI from '../spotify/api';
import { PlaylistModel, SongModel } from "../mongo/models";
import { GenericTrack } from "./searchProcedures";
import { deconstructSongUri } from "./playlistSongManagementProcedures";

interface UserPlaylistMetadata {
    id: string,
    name: string,
    createdEpochSecs: number,
}

export const newPlaylistProcedure = procedure
    .input(
        z.object({
            playlistName: z.string()
        }),
    )
    .mutation(async ({ input, ctx }): Promise<UserPlaylistMetadata> => {
        const accessToken = ctx.spotifyAuthToken
        if (!accessToken) {
            throw new Error("No auth token found in request")
        }

        const spotifyUser = await spotifyAPI.getMe(accessToken)
        const userId = spotifyUser.id

        const createdEpochSecs = Math.round(Date.now() / 1000)

        const dbPlaylist = (await PlaylistModel().create({
            ownerId: userId,
            name: input.playlistName,
            createdEpochSecs: createdEpochSecs,
            songIds: []
        }))

        const newPlaylist: UserPlaylistMetadata = {
            id: dbPlaylist._id.toString(),
            name: dbPlaylist.name,
            createdEpochSecs: dbPlaylist.createdEpochSecs,
            // songs: []
        }

        return newPlaylist
    })

export const listUserPlaylistsProcedure = procedure
    .input(
        z.object({
        })
    ).query(async ({ input, ctx }): Promise<UserPlaylistMetadata[]> => {
        const accessToken = ctx.spotifyAuthToken
        if (!accessToken) {
            throw new Error("No auth token found in request")
        }

        const spotifyUser = await spotifyAPI.getMe(accessToken)
        const userId = spotifyUser.id

        const dbPlaylists = await PlaylistModel().find({ ownerId: userId })

        const playlists: UserPlaylistMetadata[] = dbPlaylists.map((dbPlaylist) => {
            return {
                id: dbPlaylist._id.toString(),
                name: dbPlaylist.name,
                createdEpochSecs: dbPlaylist.createdEpochSecs,
            }
        })

        return playlists
    })
