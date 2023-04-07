import { trpc } from '@/core/appTrpc'
import { GenericTrack } from '@/server/routers/searchProcedures'
import { AddIcon, CheckIcon, SearchIcon } from '@chakra-ui/icons'
import { Box, Divider, HStack, IconButton, Image, Input, Modal, ModalContent, ModalOverlay, Spinner, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { DEFAULT_COVER_ART_IMAGE, FullPlaylist } from './PlaylistView'

const SearchModal = ({ isOpen, onClose, currentPlaylist, refreshCurrentPlaylist }: { isOpen: boolean, onClose: () => void, currentPlaylist?: FullPlaylist, refreshCurrentPlaylist: () => {} }) => {
    const [searchQuery, setSearchQuery] = useState("")
    // array of song platformspecificids that are pending an update (e.g. adding to playlist)
    const [songsPendingUpdate, setSongsPendingUpdate] = useState<string[]>([])

    const { data: searchResults } = trpc.searchTracks.useQuery({ searchQuery: searchQuery }, { enabled: isOpen })
    const { mutateAsync: addSongToPlaylist } = trpc.addSongToPlaylist.useMutation({})


    const songs = searchResults?.map((song) => (
        {
            alreadyAdded: currentPlaylist?.songs.find((s) => s.platformSpecificId === song.platformSpecificId && s.platform === song.platform) != undefined,
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
                    // platform: platform
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
                    <HStack w="100%">
                        <SearchIcon />
                        <Input placeholder="Search for songs" variant="flushed" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                    </HStack>
                </VStack>
                <Divider />
                <VStack py="2" maxH="66vh" overflow="scroll">
                    {songs?.map((song) => (
                        <HStack w="100%" px="4" justifyContent="space-between">
                            <HStack>
                                <Image src={song.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} w="4em" borderRadius="lg" />
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