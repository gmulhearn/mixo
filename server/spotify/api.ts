import { MeOutput, SearchInput, searchInputToUrlParams, SearchOutput, SpotifyTrackObject } from "./types"

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"

const fetchSpotifyApiWithAuth = async (accessToken: string, route: string, urlParams?: URLSearchParams): Promise<any> => {
    const url = new URL(`${SPOTIFY_API_BASE_URL}/${route}`)

    urlParams?.forEach((val, key) => {
        url.searchParams.append(key, val)
    })

    return await fetch(url.toString(), {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    })
}

export const getMe = async (accessToken: string): Promise<MeOutput> => {

    const response = await fetchSpotifyApiWithAuth(accessToken, "me")

    return await response.json() as MeOutput
}

export const searchTracks = async (accessToken: string, search: string, limit?: number, offset?: number): Promise<SpotifyTrackObject[]> => {
    const input: SearchInput = {
        q: search,
        type: ["track"],
        limit,
        offset
    }

    const urlParams = searchInputToUrlParams(input)

    const response = await fetchSpotifyApiWithAuth(accessToken, "search", urlParams)

    const searchResult = await response.json() as SearchOutput

    return searchResult.tracks.items
}

export const getTrackById = async (accessToken: string, trackId: string): Promise<SpotifyTrackObject> => {
    const response = await fetchSpotifyApiWithAuth(accessToken, `tracks/${trackId}`)

    const trackResult = await response.json() as SpotifyTrackObject

    return trackResult
}