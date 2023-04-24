import { trpc } from '@/core/appTrpc'
import { Center, Spinner, useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import DashboardFrame from '@/components/DashboardFrame'
import { SidebarPlaylistMetadata } from '@/components/DashboardPlaylistSidebar'
import PlaylistView, { FullPlaylist } from '@/components/PlaylistView'
import PlayerFooter from '@/components/PlayerFooter'
import { GenericTrack } from '@/server/routers/searchProcedures'
import Head from 'next/head'
import { useConsoleLog } from '@/utils/useConsoleLog'
import QueueView, { PRIORITY_QUEUE_DROPPABLE_ID } from '@/components/QueueView'
import { v4 } from 'uuid'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'

const Dashboard = () => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        const expires = Cookies.get("SPOTIFY_AUTH_TOKEN_EXPIRES_EPOCH")
        if (!expires) {
            setIsAuthorized(false)
        } else {
            setIsAuthorized(true)
        }
    }, [])

    if (!isAuthorized) {
        return <div>Go away!</div>
    }

    return <AuthorizedDashboard />
}

interface PriorityQueueSong {
    id: string, // local UUID ID, just used to differentiate items considering indexes can change with rearranging
    song: GenericTrack
}

const AuthorizedDashboard = () => {
    const toast = useToast()

    // tie current playlist ID into localstorage for some persistence between page refreshes
    const [currentPlaylistId, setCurrentPlaylistId] = useState<string | undefined>(localStorage.getItem("MIXO_CURRENT_PLAYLIST_ID") ?? undefined)
    useEffect(() => {
        if (!currentPlaylistId) return
        localStorage.setItem("MIXO_CURRENT_PLAYLIST_ID", currentPlaylistId)
    }, [currentPlaylistId])
    const [currentSong, setCurrentSong] = useState<GenericTrack | undefined>(undefined)
    // where regularIndex is the unshuffled-index
    const [currentQueue, setCurrentQueue] = useState<{ track: GenericTrack, regularIndex: number }[] | undefined>(undefined)
    const [playingIndexInQueue, setPlayingIndexInQueue] = useState<number | undefined>(undefined)
    // priority queue used to track songs which are manually queued by users
    const [priorityQueue, setPriorityQueue] = useState<PriorityQueueSong[]>([])
    const [queueViewShowing, setQueueViewShowing] = useState(false)
    const [repeatEnabled, setRepeatEnabled] = useState(true)
    const [shuffleEnabled, setShuffleEnabled] = useState(false)

    const { data: spotifyUserDetails } = trpc.spotifyMe.useQuery()
    const { data: currentSpotifyAccessToken } = trpc.getAccessToken.useQuery()
    const { data: playlists, refetch: getPlaylists } = trpc.listPlaylists.useQuery({})
    const { data: currentFullPlaylistData, refetch: refetchCurrentPlaylist } = trpc.getFullPlaylistById.useQuery({ playlistId: currentPlaylistId ?? "" }, { enabled: currentPlaylistId != undefined })

    const userDetails: { displayName: string, imageUrl?: string } | undefined = spotifyUserDetails ? {
        displayName: spotifyUserDetails.display_name,
        imageUrl: spotifyUserDetails.images.at(0)?.url
    } : undefined
    const playlistsMetadata: SidebarPlaylistMetadata[] | undefined = playlists
    const currentPlaylist: FullPlaylist | undefined = currentFullPlaylistData ? {
        id: currentFullPlaylistData.id,
        name: currentFullPlaylistData.name,
        songs: currentFullPlaylistData.songs.sort((a, b) => (a.addedEpochMs - b.addedEpochMs))
    } : undefined

    const playSong = (song: GenericTrack, indexInPlaylist?: number) => {
        setCurrentSong(song)

        if (!currentPlaylist || indexInPlaylist === undefined) return
        let playlistSongs = currentPlaylist.songs

        let sortedQueue = playlistSongs.map(({ song }, i) => ({ track: song, regularIndex: i }))
        if (shuffleEnabled) {
            // remove current song
            let newQueue = sortedQueue.slice()
            newQueue.splice(indexInPlaylist, 1)

            // shuffle songs
            let newShuffledQueue = shuffleArray(newQueue)

            // add back our original song to start of queue
            newShuffledQueue.unshift({ track: song, regularIndex: indexInPlaylist })

            // set queue, where we are currently in position 0!
            setCurrentQueue(newShuffledQueue)
            setPlayingIndexInQueue(0)
        } else {
            setCurrentQueue(sortedQueue)
            setPlayingIndexInQueue(indexInPlaylist)
        }
    }

    const playNextSong = () => {
        // first play from priority queue if exists
        let prioritySong = priorityQueue.at(0)
        if (prioritySong) {
            setCurrentSong(prioritySong.song)
            setPriorityQueue(priorityQueue.slice(1))
            return
        }

        if (!currentQueue || playingIndexInQueue === undefined) return

        const nextIndex = (playingIndexInQueue + 1) % currentQueue.length
        // if next index is to restart the queue and repeat is disabled, escape
        if (nextIndex == 0 && !repeatEnabled) {
            setCurrentSong(undefined)
            setPlayingIndexInQueue(undefined)
            return
        }
        const nextSong = currentQueue.at(nextIndex)

        if (!nextSong) return // impossible

        setPlayingIndexInQueue(nextIndex)
        setCurrentSong(nextSong.track)
    }

    const playPreviousSong = () => {
        if (!currentQueue || playingIndexInQueue === undefined) return

        const prevIndex = playingIndexInQueue - 1
        const adjustedPrevIndex = prevIndex < 0 ? currentQueue.length + prevIndex : prevIndex
        const prevSong = currentQueue.at(adjustedPrevIndex)

        if (!prevSong) return // impossible

        setPlayingIndexInQueue(adjustedPrevIndex)
        setCurrentSong(prevSong.track)
    }

    const toggleRepeatEnabled = () => {
        setRepeatEnabled((prev) => !prev)
    }

    const toggleShuffleEnabled = () => {
        if (!currentQueue || playingIndexInQueue === undefined) return

        if (shuffleEnabled) {
            // find current song
            let currentQueueSong = currentQueue[playingIndexInQueue]
            let currentSongNormalIndex = currentQueueSong.regularIndex

            // sort songs
            let sortedQueue = currentQueue.sort((a, b) => a.regularIndex - b.regularIndex)
            setCurrentQueue(sortedQueue)
            // fix index
            setPlayingIndexInQueue(currentSongNormalIndex)
        } else {
            // remember current song's regular index
            let currentQueueSong = currentQueue[playingIndexInQueue]

            // remove current song
            let newQueue = currentQueue.slice()
            newQueue.splice(playingIndexInQueue, 1)

            // shuffle songs
            let newShuffledQueue = shuffleArray(newQueue)

            // add back our original song to start of queue
            newShuffledQueue.unshift(currentQueueSong)

            // set queue, where we are currently in position 0!
            setCurrentQueue(newShuffledQueue)
            setPlayingIndexInQueue(0)
        }
        setShuffleEnabled((prev) => !prev)
    }

    const addSongToPriorityQueue = (song: GenericTrack) => {
        setPriorityQueue((curr) => ([...curr, { id: v4(), song: song }]))
        toast({
            title: "Added to queue",
            status: "success",
            duration: 1000,
            position: 'top',
            isClosable: true
        })
    }

    const removeSongFromPriorityQueue = (index: number) => {
        setPriorityQueue((curr) => {
            curr.splice(index, 1)
            return curr.slice() // clone array trick
        })
    }

    const changeCurrentPlaylist = (playlistId?: string) => {
        setCurrentPlaylistId(playlistId)
        // hide queue screen if showing
        setQueueViewShowing(false)
    }

    const handleDNDDropEnd = (result: DropResult) => {
        // currently we only handle priority queue rearranging
        if (result.destination?.droppableId !== PRIORITY_QUEUE_DROPPABLE_ID || result.source.droppableId !== PRIORITY_QUEUE_DROPPABLE_ID) return
        let originalIndex = result.source.index
        let newIndex = result.destination.index

        let newQueue = priorityQueue.slice()
        let item = newQueue[originalIndex]
        newQueue.splice(originalIndex, 1)
        newQueue.splice(newIndex, 0, item)

        setPriorityQueue(newQueue)
    }

    return (
        <>
            <DragDropContext
                onDragEnd={handleDNDDropEnd}
            >
                <Head>
                    <title>Mixo - Dashboard</title>
                    <meta name="description" content="Mixo streamer" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <DashboardFrame userDetails={userDetails} playlistsMetadata={playlistsMetadata} setCurrentPlaylistId={changeCurrentPlaylist} currentPlaylist={currentPlaylist} refreshCurrentPlaylist={refetchCurrentPlaylist} refreshPlaylists={getPlaylists}>
                    {queueViewShowing ? (
                        <QueueView priorityQueue={priorityQueue} playSong={playSong} addSongToPriorityQueue={addSongToPriorityQueue} removeSongFromPriorityQueue={removeSongFromPriorityQueue} currentQueue={currentQueue?.map(({ track }) => track)} playingIndexInQueue={playingIndexInQueue} />
                    ) : (
                        <>
                            {currentPlaylist ? (
                                <PlaylistView playlist={currentPlaylist} playSong={playSong} currentSong={currentSong} refreshCurrentPlaylist={refetchCurrentPlaylist} refreshPlaylists={getPlaylists} addSongToPriorityQueue={addSongToPriorityQueue} />
                            ) : (
                                currentPlaylistId ? (
                                    <Center mt="8">
                                        <Spinner />
                                    </Center>
                                ) : (
                                    <>
                                        Select a playlist..
                                    </>
                                )
                            )}
                        </>
                    )}
                </DashboardFrame>
                {currentSpotifyAccessToken ? (
                    <PlayerFooter
                        spotifyAccessToken={currentSpotifyAccessToken}
                        currentSong={currentSong}
                        playNextSong={playNextSong}
                        playPreviousSong={playPreviousSong}
                        repeatEnabled={repeatEnabled}
                        shuffleEnabled={shuffleEnabled}
                        toggleRepeatEnabled={toggleRepeatEnabled}
                        toggleShuffleEnabled={toggleShuffleEnabled}
                        queueViewShowing={queueViewShowing}
                        toggleShowQueueView={() => { setQueueViewShowing((prev) => !prev) }}
                    />
                ) : (
                    <></>
                )}
            </DragDropContext>
        </>
    )
}

export default Dashboard

function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}