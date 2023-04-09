import { trpc } from '@/core/appTrpc'
import { Center, Spinner } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import DashboardFrame from '@/components/DashboardFrame'
import { SidebarPlaylistMetadata } from '@/components/DashboardPlaylistSidebar'
import PlaylistView, { FullPlaylist } from '@/components/PlaylistView'
import PlayerFooter from '@/components/PlayerFooter'
import { GenericTrack } from '@/server/routers/searchProcedures'

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

const AuthorizedDashboard = () => {
    // tie current playlist ID into localstorage for some persistence between page refreshes
    const [currentPlaylistId, setCurrentPlaylistId] = useState<string | undefined>(localStorage.getItem("MIXO_CURRENT_PLAYLIST_ID") ?? undefined)
    useEffect(() => {
        if (!currentPlaylistId) return
        localStorage.setItem("MIXO_CURRENT_PLAYLIST_ID", currentPlaylistId)
    }, [currentPlaylistId])
    const [currentSong, setCurrentSong] = useState<GenericTrack | undefined>(undefined)
    const [playingIndexInPlaylist, setPlayingIndexInPlaylist] = useState<number | undefined>(undefined)

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

        if (indexInPlaylist === undefined) return
        setPlayingIndexInPlaylist(indexInPlaylist)
    }

    const playNextSong = () => {
        if (!currentPlaylist || playingIndexInPlaylist === undefined) return

        const nextIndex = (playingIndexInPlaylist + 1) % currentPlaylist.songs.length
        const nextSong = currentPlaylist.songs.at(nextIndex)?.song

        if (!nextSong) return

        setPlayingIndexInPlaylist(nextIndex)
        setCurrentSong(nextSong)
    }

    const playPreviousSong = () => {
        if (!currentPlaylist || playingIndexInPlaylist === undefined) return

        const prevIndex = playingIndexInPlaylist - 1
        const adjustedPrevIndex = prevIndex < 0 ? currentPlaylist.songs.length + prevIndex : prevIndex
        const prevSong = currentPlaylist.songs.at(adjustedPrevIndex)?.song

        if (!prevSong) return

        setPlayingIndexInPlaylist(adjustedPrevIndex)
        setCurrentSong(prevSong)
    }

    return (
        <>
            <DashboardFrame userDetails={userDetails} playlistsMetadata={playlistsMetadata} setCurrentPlaylistId={setCurrentPlaylistId} currentPlaylist={currentPlaylist} refreshCurrentPlaylist={refetchCurrentPlaylist} refreshPlaylists={getPlaylists}>
                {currentPlaylist ? (
                    <PlaylistView playlist={currentPlaylist} playSong={playSong} currentSong={currentSong} />
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
            </DashboardFrame>
            {currentSpotifyAccessToken ? (
                <PlayerFooter spotifyAccessToken={currentSpotifyAccessToken} currentSong={currentSong} playNextSong={playNextSong} playPreviousSong={playPreviousSong} />
            ) : (
                <></>
            )}
        </>
    )
}

export default Dashboard