import { z } from "zod";
import { procedure } from "../trpc";
import * as spotifyAPI from '../spotify/api';
import { PlaylistModel } from "../mongo/models";

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

export const deletePlaylistProcedure = procedure
    .input(
        z.object({
            playlistId: z.string()
        })
    ).mutation(async ({ input, ctx }): Promise<void> => {
        const accessToken = ctx.spotifyAuthToken
        if (!accessToken) {
            throw new Error("No auth token found in request")
        }

        const spotifyUser = await spotifyAPI.getMe(accessToken)
        const userId = spotifyUser.id

        const dbPlaylist = await PlaylistModel().findOne({ _id: input.playlistId })

        if (!dbPlaylist) {
            throw new Error(`No playlist found with ID: ${input.playlistId}`)
        }

        if (dbPlaylist.ownerId !== userId) {
            throw new Error("Cannot delete playlists not owned by you")
        }

        await dbPlaylist.deleteOne()
    })