export interface SpotifyImage { url: string, height?: string, width?: string }

export interface MeOutput {
    id: string,
    country: string,
    display_name: string,
    email: string,
    images: SpotifyImage[]
}

export interface SearchInput {
    q: string,
    type: string[],
    market?: string,
    limit?: number,
    offset?: number,
}

export const searchInputToUrlParams = (input: SearchInput): URLSearchParams => {
    const params = new URLSearchParams()

    params.append("q", input.q)
    params.append("type", input.type.join(","))

    if (input.market) {
        params.append("market", input.market)
    }
    if (input.limit) {
        params.append("limit", input.limit.toString())
    }
    if (input.offset) {
        params.append("offset", input.offset.toString())
    }
    return params
}

export interface SearchOutput {
    tracks: {
        items: SpotifyTrackObject[]
    }
    // TODO - there is more, but we will just focus on TRACKS for now
}

export interface SpotifyTrackObject {
    id: string,
    name: string,
    artists: {
        id: string,
        name: string,
        images: SpotifyImage[],
    }[],
    album: {
        id: string,
        // album_type: string,
        name: string,
        images: SpotifyImage[]
    }
}