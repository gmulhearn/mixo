import { z } from 'zod';
import * as spotifyAPI from '../spotify/api';
import { procedure } from '../trpc';

export const meProcedure = procedure
    .query(async ({ input, ctx }) => {
        const accessToken = ctx.spotifyAuthToken
        if (!accessToken) {
            throw new Error("No auth token found in request")
        }

        const res = await spotifyAPI.getMe(accessToken)

        return res;
    })

// TODO - long term we want to remove this.. ideally the client should not have access to their access token
export const getAccessTokenProcedure = procedure.query(({ ctx }) => {
    return ctx.spotifyAuthToken
})