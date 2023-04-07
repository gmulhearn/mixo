// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let { code } = req.query

    if (!code) {
        // TODO
        return
    }

    let formData = new URLSearchParams()
    formData.append("code", code as string) // TODO - as string silliness
    formData.append("redirect_uri", "http://localhost:3000/api/spotify/callback")
    formData.append("grant_type", 'authorization_code')

    let client_id = process.env.SPOTIFY_CLIENT_ID
    let client_secret = process.env.SPOTIFY_CLIENT_SECRET

    let spotifyResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "post",
        body: formData,
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
    })

    let { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = await spotifyResponse.json() as { access_token: string, refresh_token: string, expires_in: string }

    // TODO - consider refresh: https://indepth.dev/posts/1382/localstorage-vs-cookies

    const spotifyAuthTokenExpiresEpoch = Date.now() + Number(expiresIn)
    res.setHeader('Set-Cookie', [
        serialize("SPOTIFY_AUTH_TOKEN", accessToken, { httpOnly: true, path: "/", maxAge: Number(expiresIn) }),
        // set auth token expires as a marker for the front end to use for being aware of when their token will expire
        serialize("SPOTIFY_AUTH_TOKEN_EXPIRES_EPOCH", spotifyAuthTokenExpiresEpoch.toString(), { httpOnly: false, path: "/", maxAge: Number(expiresIn) }),
        serialize("SPOTIFY_REFRESH_TOKEN", refreshToken, { httpOnly: true, path: "/" })
    ])

    res.redirect("http://localhost:3000/dashboard")
}