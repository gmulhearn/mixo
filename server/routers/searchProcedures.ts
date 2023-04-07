import { SpotifyTrackObject } from './../spotify/types';
import { z } from "zod"
import { procedure } from "../trpc"
import * as spotifyAPI from "../spotify/api"

// TODO better location
export enum TrackPlatform {
    Spotify,
    Youtube
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

        const spotifyTracks = await spotifyAPI.searchTracks(accessToken, input.searchQuery, 10, 0)

        const spotifyGenericTracks = spotifyTracks.map(spotifyTrackToGeneric)

        return spotifyGenericTracks
    })