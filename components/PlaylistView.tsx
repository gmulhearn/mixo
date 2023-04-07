import { GenericTrack } from '@/server/routers/searchProcedures'
import { Box, Divider, Heading, HStack, Image, Text, VStack } from '@chakra-ui/react'
import React from 'react'

export const DEFAULT_COVER_ART_IMAGE = "TODO"

export interface FullPlaylist {
    id: String,
    name: String,
    songs: GenericTrack[]
}

const PlaylistView = ({ playlist }: { playlist: FullPlaylist }) => {
    return (
        <Box w="100%">
            <Heading>{playlist.name}</Heading>
            <Divider my="4" />
            <VStack mx="4">
                {playlist.songs.map((song) => (
                    <>
                        <SongItemView song={song} />
                        <Divider />
                    </>
                ))}
            </VStack>
        </Box>
    )
}

const SongItemView = ({ song }: { song: GenericTrack }) => {

    return (
        <Box w="100%">
            <HStack>
                <Image src={song.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} w="4em" borderRadius="lg" />
                <VStack alignItems="start">
                    <Text fontWeight="bold">{song.title}</Text>
                    <Text color="gray.400" >{song.artists.join(", ")}</Text>
                </VStack>
            </HStack>
        </Box>
    )
}

export default PlaylistView