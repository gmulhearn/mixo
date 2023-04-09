import { SpotifyTrackObject } from './../spotify/types';
import { z } from "zod"
import { procedure } from "../trpc"
import * as spotifyAPI from "../spotify/api"
import * as youtubeAPI from "../youtube/api"
import { YoutubeVideoMetadata } from '../youtube/parser.service';

// TODO better location
export enum TrackPlatform {
    Spotify = 0,
    Youtube = 1
}

// uniquely identified by platformId + platform
// TODO better location
export interface GenericTrack {
    platformSpecificId: string,
    platform: TrackPlatform,
    title: string,
    artists: string[],
    coverArtImageUrl?: string,
}

const spotifyTrackToGeneric = (track: SpotifyTrackObject): GenericTrack => {
    return {
        platformSpecificId: track.id,
        platform: TrackPlatform.Spotify,
        title: track.name,
        artists: track.artists.map((artist) => artist.name),
        coverArtImageUrl: track.album.images.at(0)?.url
    }
}

const youtubeVideoToGeneric = (video: YoutubeVideoMetadata): GenericTrack => {
    return {
        platformSpecificId: video.id,
        platform: TrackPlatform.Youtube,
        title: video.title,
        artists: [video.channelName],
        coverArtImageUrl: video.thumbnailImageUrl
    }
}

export const searchTracksProcedure = procedure
    .input(
        z.object({
            searchQuery: z.string()
        })
    ).query(async ({ input, ctx }): Promise<GenericTrack[]> => {

        const accessToken = ctx.spotifyAuthToken
        if (!accessToken) {
            throw new Error("No auth token found in request")
        }

        if (input.searchQuery.trim().length <= 0) return []

        console.log("SEARCH PROCEDURE WITH: ", input.searchQuery)

        const youtubeVideos = await youtubeAPI.searchVideos(input.searchQuery, 10)
        const spotifyTracks = await spotifyAPI.searchTracks(accessToken, input.searchQuery, 10, 0)

        const youtubeGenericTracks = youtubeVideos.map(youtubeVideoToGeneric)
        const spotifyGenericTracks = spotifyTracks.map(spotifyTrackToGeneric)

        const allTracks = spotifyGenericTracks.concat(youtubeGenericTracks)

        return allTracks
    })