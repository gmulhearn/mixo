import { GenericTrack } from '@/server/routers/searchProcedures'
import { Box, Divider, Flex, Heading, HStack, IconButton, Image, Text, VStack } from '@chakra-ui/react'
import React, { Fragment, useState } from 'react'
import { FaPlay } from "react-icons/fa"

export const DEFAULT_COVER_ART_IMAGE = "TODO"

export interface FullPlaylist {
    id: string,
    name: string,
    songs: { song: GenericTrack, addedEpochMs: number }[]
}

const PlaylistView = ({ playlist, playSong, currentSong }: { playlist: FullPlaylist, playSong: (song: GenericTrack, indexInPlaylist?: number) => void, currentSong?: GenericTrack }) => {
    return (
        <Box w="100%">
            <Heading>{playlist.name}</Heading>
            <Divider my="4" />
            <VStack mx="4" mb="16" >
                {playlist.songs.map((song, index) => (
                    <Fragment key={song.song.platformSpecificId}>
                        <SongItemView song={song.song} playSong={() => { playSong(song.song, index) }} isCurrentlyPlaying={currentSong?.platformSpecificId == song.song.platformSpecificId} />
                        <Divider />
                    </Fragment>
                ))}
            </VStack>
        </Box>
    )
}

const SongItemView = ({ song, playSong, isCurrentlyPlaying }: { song: GenericTrack, playSong: () => void, isCurrentlyPlaying: boolean }) => {
    const [songIsHovered, setSongIsHovered] = useState(false)

    return (
        <Box w="100%" onMouseEnter={() => { setSongIsHovered(true) }} onMouseLeave={() => { setSongIsHovered(false) }}>
            <HStack>
                <Box position="relative">
                    <Flex w="100%" h="100%" position="absolute" justifyContent="center" alignItems="center">
                        <IconButton
                            hidden={!songIsHovered}
                            aria-label="play song"
                            variant="ghost"
                            onClick={playSong}
                            icon={<FaPlay />}
                        />
                    </Flex>
                    <Image src={song.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} w="4em" borderRadius="lg" />
                </Box>
                <VStack alignItems="start">
                    <Text fontWeight="bold" noOfLines={1} color={isCurrentlyPlaying ? "cyan.300" : "white"}>{song.title}</Text>
                    <Text color="gray.400" noOfLines={1}>{song.artists.join(", ")}</Text>
                </VStack>
            </HStack>
        </Box>
    )
}

export default PlaylistView