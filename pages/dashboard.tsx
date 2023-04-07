import { trpc } from '@/core/appTrpc'
import { AuthTokens, getAuthTokens } from '@/core/spotifyAPI'
import { TrackPlatform } from '@/server/routers/searchProcedures'
import { useConsoleLog } from '@/utils/useConsoleLog'
import { Button, Card, Flex, Heading, HStack, Image, Input, Text, VStack } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import Cookies from 'js-cookie'

const Dashboard = () => {
    // const [authTokens, setAuthTokens] = useState<AuthTokens | undefined>(undefined)
    const [isAuthorized, setIsAuthorized] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        const expires = Cookies.get("SPOTIFY_AUTH_TOKEN_EXPIRES_EPOCH")
        if (!expires) {
            setIsAuthorized(false)
        } else {
            setIsAuthorized(true)
        }
        // const authTokens = getAuthTokens(window.location)

        // setAuthTokens(authTokens)
    }, [])

    if (!isAuthorized) {
        return <div>Go away!</div>
    }

    return <AuthorizedDashboard />
}

const AuthorizedDashboard = () => {

    const [trackSearch, setTrackSearch] = useState("")
    const [newPlaylistName, setNewPlaylistName] = useState("")
    const [songIdToAdd, setSongIdToAdd] = useState("")

    // const x = trpc.spotifyMe.useQuery({ accessToken: authTokens.accessToken }).data
    const { data: trackResults, refetch: searchTracks } = trpc.searchTracks.useQuery({ searchQuery: trackSearch }, { enabled: trackSearch.trim().length > 0 })
    const { mutate: newPlaylist } = trpc.newPlaylist.useMutation()
    const { data: playlists, refetch: getPlaylists } = trpc.listPlaylists.useQuery({})
    const { mutate: addSongToPlaylist } = trpc.addSongToPlaylist.useMutation()

    useEffect(() => {
        // addSongToPlaylist({accessToken: "", playlistId: "", song: { platformSpecificId: ""}})
        // newPlaylist({ accessToken: authTokens.accessToken, playlistName: "newPlaylistName" })

    }, [])

    useConsoleLog(trackResults)

    return (
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
    )
}

export default Dashboard