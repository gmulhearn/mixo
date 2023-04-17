import { z } from "zod";
import { procedure } from "../trpc";
import { GenericTrack, TrackPlatform } from "./searchProcedures";
import * as spotifyAPI from "../spotify/api"
import * as youtubeAPI from "../youtube/api"
import { ISong, PlaylistModel, SongModel } from "../mongo/models";

const constructSongUri = (song: { platformSpecificId: string, platform: TrackPlatform }): string => {
    let platformMethod = ""
    switch (song.platform) {
        case TrackPlatform.Spotify:
            platformMethod = "spotify"
            break
        case TrackPlatform.Youtube:
            platformMethod = "youtube"
            break
        default:
            throw new Error(`UNKNOWN PLATFORM USED: ${song.platform}`)
    }

    return `mixo:${platformMethod}:${song.platformSpecificId}`
}

export const deconstructSongUri = (songUri: string): { platformSpecificId: string, platform: TrackPlatform } => {
    const parts = songUri.split(":")

    if (parts.length !== 3) {
        throw new Error(`invalid URI provided: ${songUri}`)
    }

    const platformSpecificId = parts[2]

    const platformMethod = parts[1]
    let platform: TrackPlatform | undefined = undefined
    switch (platformMethod) {
        case "spotify":
            platform = TrackPlatform.Spotify
            break
        case "youtube":
            platform = TrackPlatform.Youtube
            break
        default:
            throw new Error(`UNKNOWN PLATFORM METHOD USED: ${platformMethod}`)
    }

    return {
        platformSpecificId,
        platform
    }
}

export const addSongToPlaylistProcedure = procedure.input(
    z.object({
        playlistId: z.string(),
        song: z.object({
            platformSpecificId: z.string(),
            platform: z.nativeEnum(TrackPlatform)
        })
    })
).mutation(async ({ input, ctx }): Promise<void> => {
    const accessToken = ctx.spotifyAuthToken
    if (!accessToken) {
        throw new Error("No auth token found in request")
    }

    const spotifyUser = await spotifyAPI.getMe(accessToken)
    const userId = spotifyUser.id
    const songUri = constructSongUri({ platformSpecificId: input.song.platformSpecificId, platform: input.song.platform })

    const dbPlaylist = await PlaylistModel().findById(input.playlistId)

    if (dbPlaylist == undefined) {
        throw new Error(`Could not find playlist: ${input.playlistId}`)
    }

    if (dbPlaylist.ownerId !== userId) {
        throw new Error(`Cannot add song to playlist not owned by user: ${userId}`)
    }

    if (dbPlaylist.songs.find((song) => song.songUri == songUri)) {
        throw new Error(`Song is already in the playlist: ${songUri}`)
    }

    // add song metadata as songmodel if non-existent
    const existingSong = await SongModel().findById(songUri)
    if (!existingSong) {

        let songTitle = ""
        let songArtists: string[] = []
        let covertArtUrl: string | undefined = undefined

        if (input.song.platform === TrackPlatform.Spotify) {
            const spotifyTrack = await spotifyAPI.getTrackById(accessToken, input.song.platformSpecificId)
            songTitle = spotifyTrack.name
            songArtists = spotifyTrack.artists.map((artist) => artist.name)
            covertArtUrl = spotifyTrack.album.images.at(0)?.url
        } else if (input.song.platform === TrackPlatform.Youtube) {
            const youtubeVideos = await youtubeAPI.searchVideos(input.song.platformSpecificId)
            const youtubeVideo = youtubeVideos.find((video) => (video.id == input.song.platformSpecificId))
            if (!youtubeVideo) {
                throw new Error(`Could not find youtube video with id: ${input.song.platformSpecificId}`)
            }
            songTitle = youtubeVideo.title
            songArtists = [youtubeVideo.channelName]
            covertArtUrl = youtubeVideo.thumbnailImageUrl
        } else {
            throw new Error(`Unable to resolve track of type: ${input.song.platform}`)
        }

        const dbSong: ISong = {
            _id: songUri,
            title: songTitle,
            artists: songArtists,
            coverArtUrl: covertArtUrl
        }
        await SongModel().insertMany(dbSong)
    }

    // add songUri to playlist
    const currentEpochMs = Date.now()
    dbPlaylist.songs.push({ songUri: songUri, addedEpochMs: currentEpochMs })
    await dbPlaylist.save()

    return
})

export const removeSongFromPlaylistProcedure = procedure.input(
    z.object({
        playlistId: z.string(),
        song: z.object({
            platformSpecificId: z.string(),
            platform: z.nativeEnum(TrackPlatform)
        })
    })
).mutation(async ({ input, ctx }): Promise<void> => {
    const accessToken = ctx.spotifyAuthToken
    if (!accessToken) {
        throw new Error("No auth token found in request")
    }

    const spotifyUser = await spotifyAPI.getMe(accessToken)
    const userId = spotifyUser.id

    const songUriToDelete = constructSongUri({ platformSpecificId: input.song.platformSpecificId, platform: input.song.platform })

    const dbPlaylist = await PlaylistModel().findById(input.playlistId)

    if (dbPlaylist == undefined) {
        throw new Error(`Could not find playlist: ${input.playlistId}`)
    }

    if (dbPlaylist.ownerId !== userId) {
        throw new Error(`Cannot add song to playlist not owned by user: ${userId}`)
    }

    dbPlaylist.songs = dbPlaylist.songs.filter(({ songUri }) => songUri !== songUriToDelete)

    await dbPlaylist.save()

    return
})

interface UserPlaylistFullDetails {
    id: string,
    name: string,
    createdEpochSecs: number,
    songs: { song: GenericTrack, addedEpochMs: number }[]
}

export const getFullPlaylistByIdProcedure = procedure
    .input(z.object({
        playlistId: z.string()
    }))
    .query(async ({ input, ctx }): Promise<UserPlaylistFullDetails> => {
        const dbPlaylist = await PlaylistModel().findById(input.playlistId)

        if (dbPlaylist == undefined) {
            throw new Error(`Could not find playlist: ${input.playlistId}`)
        }

        const songs: { song: GenericTrack, addedEpochMs: number }[] = []
        await Promise.all(dbPlaylist.songs.map(async (song) => {
            const dbSong = await SongModel().findById(song.songUri)

            if (!dbSong) {
                return
            }

            const { platformSpecificId, platform } = deconstructSongUri(song.songUri)

            const genericTrack: GenericTrack = {
                platformSpecificId,
                platform,
                title: dbSong.title,
                artists: dbSong.artists,
                coverArtImageUrl: dbSong.coverArtUrl
            }

            songs.push({ song: genericTrack, addedEpochMs: song.addedEpochMs })
        }))

        return {
            id: dbPlaylist._id.toString(),
            name: dbPlaylist.name,
            createdEpochSecs: dbPlaylist.createdEpochSecs,
            songs: songs
        }
    })