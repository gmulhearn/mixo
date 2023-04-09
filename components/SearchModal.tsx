import { trpc } from '@/core/appTrpc'
import { GenericTrack } from '@/server/routers/searchProcedures'
import { AddIcon, CheckIcon, SearchIcon } from '@chakra-ui/icons'
import { Box, Divider, HStack, IconButton, Image, Input, InputGroup, InputLeftElement, InputRightElement, Modal, ModalContent, ModalOverlay, Spinner, Text, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { DEFAULT_COVER_ART_IMAGE, FullPlaylist } from './PlaylistView'

// Class used to track what string was last requested to be searched.
// Used in conjunction with a delay after searching to ensure the search
// API is not spammed.
class PendingSearch {
    pendingSearch: string = ""
    getPendingSearch() {
        return this.pendingSearch
    }
    setPendingSearch(search: string) {
        this.pendingSearch = search
    }
}

const SearchModal = ({ isOpen, onClose, currentPlaylist, refreshCurrentPlaylist }: { isOpen: boolean, onClose: () => void, currentPlaylist?: FullPlaylist, refreshCurrentPlaylist: () => {} }) => {
    const [searchQuery, setSearchQuery] = useState("")
    // array of song platformspecificids that are pending an update (e.g. adding to playlist)
    const [songsPendingUpdate, setSongsPendingUpdate] = useState<string[]>([])
    const [pendingSearch] = useState(new PendingSearch())

    const { data: searchResults, refetch: updateSearchResults, isLoading: isSearchLoading } = trpc.searchTracks.useQuery({ searchQuery: searchQuery }, { enabled: false })
    const { mutateAsync: addSongToPlaylist } = trpc.addSongToPlaylist.useMutation({})

    // whenever `searchQuery` changes, we don't refresh the results immediately.
    // we wait a small period of time (<1sec) and check if the `searchQuery` has changed
    // again (i.e. the user is typing faster than 1 character per time period).
    useEffect(() => {
        if (!isOpen) return
        if (searchQuery.trim().length <= 0) return

        pendingSearch.setPendingSearch(searchQuery.toString())

        setTimeout(() => {
            if (pendingSearch.getPendingSearch() !== searchQuery) {
                return
            }
            updateSearchResults({})
        }, 400)

    }, [searchQuery])

    const songs = searchResults?.map((song) => (
        {
            alreadyAdded: currentPlaylist?.songs.find((s) => s.song.platformSpecificId === song.platformSpecificId && s.song.platform === song.platform) != undefined,
            ...song
        }
    ))

    const addSongToPlaylistClicked = async (song: GenericTrack) => {
        if (!currentPlaylist) return

        setSongsPendingUpdate((oldSongs) => [...oldSongs, song.platformSpecificId])

        try {
            await addSongToPlaylist({
                playlistId: currentPlaylist.id, song: {
                    platformSpecificId: song.platformSpecificId,
                    platform: song.platform
                }
            })

            refreshCurrentPlaylist()
        } catch { }

        setSongsPendingUpdate((oldSongs) => oldSongs.filter((s) => s !== song.platformSpecificId))
    }

    const isSongPendingUpdate = (song: GenericTrack): boolean => {
        return songsPendingUpdate.find((id) => id === song.platformSpecificId) !== undefined
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent mx="2">
                <VStack mx="4" my="2" >
                    <InputGroup>
                        <InputLeftElement>
                            <SearchIcon />
                        </InputLeftElement>
                        <InputRightElement
                            hidden={!isSearchLoading || searchQuery.trim().length <= 0}>
                            <Spinner />
                        </InputRightElement>
                        <Input placeholder="Search for songs" variant="flushed" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                    </InputGroup>
                </VStack>
                <Divider />
                <VStack py="2" maxH="66vh" overflow="scroll">
                    {songs?.map((song) => (
                        <HStack w="100%" px="4" justifyContent="space-between" key={song.platformSpecificId}>
                            <HStack>
                                <Image src={song.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} w="4em" borderRadius="lg" alt="cover art" />
                                <VStack alignItems="start">
                                    <Text fontWeight="bold" noOfLines={1}>{song.title}</Text>
                                    <Text color="gray.400" noOfLines={1}>{song.artists.join(", ")}</Text>
                                </VStack>
                            </HStack>

                            {!isSongPendingUpdate(song) ? (
                                !song.alreadyAdded ? (
                                    <IconButton
                                        onClick={() => { addSongToPlaylistClicked(song) }}
                                        variant="ghost"
                                        borderRadius="90"
                                        aria-label="open menu"
                                        icon={<AddIcon />}
                                    />
                                ) : (
                                    <IconButton
                                        // onClick={removeSongFromPlaylist}
                                        variant="ghost"
                                        borderRadius="90"
                                        aria-label="open menu"
                                        icon={<CheckIcon />}
                                    />
                                )
                            ) : (
                                <IconButton
                                    variant="ghost"
                                    borderRadius="90"
                                    aria-label="loading"
                                    disabled={true}
                                    icon={<Spinner />}
                                />
                            )}

                        </HStack>
                    ))}
                </VStack>
            </ModalContent>
        </Modal>
    )
}

export default SearchModal