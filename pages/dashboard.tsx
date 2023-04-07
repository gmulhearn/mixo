import { trpc } from '@/core/appTrpc'
import { Button, Card, Heading, HStack, Image, Input, Text, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import DashboardFrame from '@/components/DashboardFrame'
import { SidebarPlaylistMetadata } from '@/components/DashboardPlaylistSidebar'
import { GenericTrack } from '@/server/routers/searchProcedures'
import { useConsoleLog } from '@/utils/useConsoleLog'

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

interface FullPlaylist {
    id: String,
    name: String,
    songs: GenericTrack[]
}

const AuthorizedDashboard = () => {
    const [currentPlaylistId, setCurrentPlaylistId] = useState<string | undefined>(undefined)

    const [trackSearch, setTrackSearch] = useState("")
    const [newPlaylistName, setNewPlaylistName] = useState("")
    const [songIdToAdd, setSongIdToAdd] = useState("")

    const { data: spotifyUserDetails } = trpc.spotifyMe.useQuery({})
    const { data: trackResults, refetch: searchTracks } = trpc.searchTracks.useQuery({ searchQuery: trackSearch }, { enabled: trackSearch.trim().length > 0 })
    const { mutate: newPlaylist } = trpc.newPlaylist.useMutation()
    const { data: playlists, refetch: getPlaylists } = trpc.listPlaylists.useQuery({})
    const { mutate: addSongToPlaylist } = trpc.addSongToPlaylist.useMutation()
    const { data: currentFullPlaylistData } = trpc.getFullPlaylistById.useQuery({ playlistId: currentPlaylistId ?? "" }, { enabled: currentPlaylistId != undefined })

    const userDetails: { displayName: string, imageUrl?: string } | undefined = spotifyUserDetails ? {
        displayName: spotifyUserDetails.display_name,
        imageUrl: spotifyUserDetails.images.at(0)?.url
    } : undefined
    const playlistsMetadata: SidebarPlaylistMetadata[] = playlists ?? []
    const currentPlaylist: FullPlaylist | undefined = currentFullPlaylistData

    useConsoleLog(`CURRENT PLAYLIST: ${JSON.stringify(currentPlaylist)}`)

    return (
        <DashboardFrame userDetails={userDetails} playlistsMetadata={playlistsMetadata} onPlaylistItemClicked={setCurrentPlaylistId}>
            <VStack w="100%" justifyContent="center">
                <Card padding={8} w="50em">
                    <VStack spacing={2}>
                        <HStack>
                            <Input w="20em" placeholder='search' onChange={(e) => { setTrackSearch(e.target.value) }} value={trackSearch} />
                            <Button onClick={() => { searchTracks() }}>Search</Button>
                        </HStack>

                        <Heading size="md">Results:</Heading>
                        {trackResults?.map((track) => (
                            <HStack w="100%" key={track.platformSpecificId}>
                                <Image src={track.coverArtImageUrl} height="5em" width="5em" />
                                <Text>{track.title}</Text>
                                <Text>{track.artists}</Text>
                                <Text>DEBUG: {track.platformSpecificId}</Text>
                            </HStack>
                        )) ?? null}
                    </VStack>
                </Card>

                <HStack>
                    <Input w="20em" placeholder='playlist name' onChange={(e) => { setNewPlaylistName(e.target.value) }} value={newPlaylistName} />
                    <Button onClick={() => {
                        newPlaylist({ playlistName: newPlaylistName })
                        getPlaylists()
                    }}>Create Playlist</Button>
                </HStack>
                <Heading size="md">Playlists:</Heading>
                {playlists?.map((playlist) => (
                    <Card padding={8} w="50em" key={playlist.id}>
                        <Heading size="sm">{playlist.name}:</Heading>
                        <HStack>
                            <Input w="20em" placeholder='enter song id' onChange={(e) => { setSongIdToAdd(e.target.value) }} value={songIdToAdd} />
                            <Button onClick={() => {
                                addSongToPlaylist({
                                    playlistId: playlist.id, song: {
                                        platformSpecificId: songIdToAdd
                                    }
                                })
                                getPlaylists()
                            }}>Add Spotify Song</Button>
                        </HStack>
                        {/* <VStack spacing={2}>
                        {playlist.songs.map((track) => (
                            <HStack w="100%" key={track.platformSpecificId}>
                                <Image src={track.coverArtImageUrl} height="5em" width="5em" />
                                <Text>{track.title}</Text>
                                <Text>{track.artists}</Text>
                            </HStack>
                        )) ?? null}
                    </VStack> */}
                    </Card>
                )) ?? null}
            </VStack>
        </DashboardFrame>
    )
}

export default Dashboard