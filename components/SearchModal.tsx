import { trpc } from '@/core/appTrpc'
import { useConsoleLog } from '@/utils/useConsoleLog'
import { SearchIcon } from '@chakra-ui/icons'
import { Box, Divider, HStack, Image, Input, Modal, ModalContent, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { DEFAULT_COVER_ART_IMAGE } from './PlaylistView'

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [searchQuery, setSearchQuery] = useState("")

    const searchResults = trpc.searchTracks.useQuery({ searchQuery: searchQuery }, { enabled: isOpen })

    useConsoleLog(searchResults.data)

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
                <VStack mx="4" pt="2" maxH="66vh" overflow="scroll">
                    {searchResults.data?.map((song) => (
                        <Box w="100%">
                            <HStack>
                                <Image src={song.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} w="4em" borderRadius="lg" />
                                <VStack alignItems="start">
                                    <Text fontWeight="bold">{song.title}</Text>
                                    <Text color="gray.400" >{song.artists.join(", ")}</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    ))}
                </VStack>
                </ModalContent>
        </Modal>
    )
}

export default SearchModal