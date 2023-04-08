import { trpc } from '@/core/appTrpc'
import { Center, Spinner } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import DashboardFrame from '@/components/DashboardFrame'
import { SidebarPlaylistMetadata } from '@/components/DashboardPlaylistSidebar'
import PlaylistView, { FullPlaylist } from '@/components/PlaylistView'

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

    const { data: spotifyUserDetails } = trpc.spotifyMe.useQuery({})
    const { data: playlists, refetch: getPlaylists } = trpc.listPlaylists.useQuery({})
    const { data: currentFullPlaylistData, refetch: refetchCurrentPlaylist } = trpc.getFullPlaylistById.useQuery({ playlistId: currentPlaylistId ?? "" }, { enabled: currentPlaylistId != undefined })

    const userDetails: { displayName: string, imageUrl?: string } | undefined = spotifyUserDetails ? {
        displayName: spotifyUserDetails.display_name,
        imageUrl: spotifyUserDetails.images.at(0)?.url
    } : undefined
    const playlistsMetadata: SidebarPlaylistMetadata[] | undefined = playlists
    const currentPlaylist: FullPlaylist | undefined = currentFullPlaylistData

    return (
        <DashboardFrame userDetails={userDetails} playlistsMetadata={playlistsMetadata} onPlaylistItemClicked={setCurrentPlaylistId} currentPlaylist={currentPlaylist} refreshCurrentPlaylist={refetchCurrentPlaylist} refreshPlaylists={getPlaylists}>
            {currentPlaylist ? (
                <PlaylistView playlist={currentPlaylist} />
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
    )
}

export default Dashboard