// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let refreshToken = req.cookies[""]

    let formData = new URLSearchParams()
    formData.append("grant_type", 'refresh_token')
    formData.append("refresh_token", "http://localhost:3000/api/spotify/callback")

    let client_id = process.env.SPOTIFY_CLIENT_ID
    let client_secret = process.env.SPOTIFY_CLIENT_SECRET

    let spotifyResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "post",
        body: formData,
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
    })

    let { access_token: accessToken, expires_in: expiresIn } = await spotifyResponse.json() as { access_token: string, expires_in: string }

    // TODO - consider refresh: https://indepth.dev/posts/1382/localstorage-vs-cookies

    const spotifyAuthTokenExpiresEpoch = Date.now() + Number(expiresIn)
    res.setHeader('Set-Cookie', [
        serialize("SPOTIFY_AUTH_TOKEN", accessToken, { httpOnly: true, path: "/", maxAge: Number(expiresIn) }),
        // set auth token expires as a marker for the front end to use for being aware of when their token will expire
        serialize("SPOTIFY_AUTH_TOKEN_EXPIRES_EPOCH", spotifyAuthTokenExpiresEpoch.toString(), { httpOnly: false, path: "/", maxAge: Number(expiresIn) }),
    ])

    res.status(200).json({})
}