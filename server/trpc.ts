import { initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import connectMongoDb from './mongo/connectMongoDb';

const createContext = async ({ req, res }: CreateNextContextOptions) => {
    await connectMongoDb()

    let authToken = req.cookies["SPOTIFY_AUTH_TOKEN"]
    return {
        spotifyAuthToken: authToken
    }
}

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createContext>().create();
// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;