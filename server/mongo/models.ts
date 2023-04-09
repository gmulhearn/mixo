import { Model, model, models, Schema } from "mongoose";

interface IPlaylist {
    ownerId: string,
    name: string,
    createdEpochSecs: number,
    songs: { songUri: string, addedEpochMs: number }[]
}

const playlistSchema = new Schema<IPlaylist>({
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    createdEpochSecs: { type: Number, required: true },
    songs: {
        type: [{
            songUri: { type: String, required: true },
            addedEpochMs: { type: Number, required: true }
        }]
    }
})


export const PlaylistModel = (): Model<IPlaylist> => {
    return models && models.Playlist ? models.Playlist : model<IPlaylist>("Playlist", playlistSchema)
}

export interface ISong {
    _id: string, // the mixo URI
    title: string,
    artists: string[],
    coverArtUrl?: string
}

const songSchema = new Schema<ISong>({
    _id: String,
    title: { type: String, required: true },
    artists: { type: [String], required: true },
    coverArtUrl: { type: String, required: false }
})

export const SongModel = (): Model<ISong> => {
    return models && models.Song ? models.Song : model<ISong>("Song", songSchema)

}