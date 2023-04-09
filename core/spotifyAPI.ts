import { useState } from "react"
import { getBaseUrl } from "./appTrpc"

const BASE_SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
export const getSpotifyAuthUrl = (): string => {
    let authUrl = new URL(BASE_SPOTIFY_AUTH_URL)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("client_id", "24ef7853deb14c51bd6f72e440f35fc1")
    authUrl.searchParams.append("redirect_uri", `${getBaseUrl()}/api/spotify/callback`)
    authUrl.searchParams.append("scope", "streaming user-read-email user-read-private user-library-read user-read-playback-state user-modify-playback-state")

    return authUrl.toString()
}

export interface AuthTokens {
    accessToken: string,
    refreshToken: string
}

export const getAuthTokens = (currentLocation: Location): AuthTokens | undefined =>  {
    let locationUrl = new URL(currentLocation.toString())

    let accessToken = locationUrl.searchParams.get("accessToken")
    let refreshToken = locationUrl.searchParams.get("refreshToken")

    // TODO - try from cookies as backup and set as cookies

    if (!accessToken || !refreshToken) {
        return
    }

    return {
        accessToken,
        refreshToken
    }
}

// export const useSpotifyAuth = () => {
//     const [authTokens, setAuthTokens] = useState<AuthTokens | undefined>(undefined)

    
// }