import { z } from 'zod';
import * as spotifyAPI from '../spotify/api';
import { procedure } from '../trpc';

export const meProcedure = procedure
    .input(
        z.object({
        }),
    )
    .query(async ({ input, ctx }) => {
        const accessToken = ctx.spotifyAuthToken
        if (!accessToken) {
            throw new Error("No auth token found in request")
        }

        const res = await spotifyAPI.getMe(accessToken)

        return res;
    })

// export const searchTracksProcedure = procedure
//     .input(
//         z.object({
//             accessToken: z.string(),
//             searchQuery: z.string()
//         })
//     ).query(async ({ input }) => {
//         const res = await spotifyAPI.searchTracks(input.accessToken, input.searchQuery, 10, 0)

//         return res
//     })