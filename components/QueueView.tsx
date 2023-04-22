import { trpc } from '@/core/appTrpc'
import { GenericTrack } from '@/server/routers/searchProcedures'
import { CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import { BsThreeDots } from 'react-icons/bs'
import { Box, Divider, Flex, Heading, HStack, IconButton, Image, Input, InputGroup, InputRightElement, Menu, MenuButton, MenuItem, MenuList, Spinner, Text, Tooltip, VStack } from '@chakra-ui/react'
import React, { Fragment, useMemo, useState } from 'react'
import { FaEdit, FaOutdent, FaPlay } from "react-icons/fa"

export const DEFAULT_COVER_ART_IMAGE = "TODO"

export interface FullPlaylist {
    id: string,
    name: string,
    songs: { song: GenericTrack, addedEpochMs: number }[]
}

interface QueueViewProps {
    priorityQueue: GenericTrack[],
    playSong: (song: GenericTrack, index?: number) => void,
    addSongToPriorityQueue: (song: GenericTrack) => void,
    currentQueue: GenericTrack[] | undefined,
    playingIndexInQueue: number | undefined
}

const QueueView = ({ priorityQueue, playSong, addSongToPriorityQueue, currentQueue, playingIndexInQueue }: QueueViewProps) => {

    const mainQueueSongs: GenericTrack[] | undefined = useMemo(() => {
        if (currentQueue === undefined || playingIndexInQueue === undefined) return undefined
        return currentQueue.slice(playingIndexInQueue + 1)
    }, [currentQueue, playingIndexInQueue])

    return (
        <Box w="100%">
            <Heading>Queue</Heading>
            <Divider my="4" />
            <Heading size='md'>Playing Next</Heading>
            <Divider my="4" />
            <VStack mx="4" mb="4">
                {priorityQueue.map((song) => (
                    <Fragment key={song.platformSpecificId}>
                        <SongItemView
                            song={song}
                            playSong={() => { playSong(song) }}  // TODO - playing here is dangerous... should i just disable playing?
                            isCurrentlyPlaying={false}
                            removeSong={() => { }}
                            isUpdating={false}
                            addSongToPriorityQueue={() => { addSongToPriorityQueue(song) }}
                        />
                        <Divider />
                    </Fragment>
                ))}
            </VStack>
            <Heading size='md'>Playing After</Heading>
            <Divider my="4" />
            <VStack mx="4" mb="16">
            {mainQueueSongs?.map((song) => (
                    <Fragment key={song.platformSpecificId}>
                        <SongItemView
                            song={song}
                            playSong={() => { playSong(song) }} // TODO - playing here is dangerous... should i just disable playing?
                            isCurrentlyPlaying={false}
                            removeSong={() => { }}
                            isUpdating={false}
                            addSongToPriorityQueue={() => { addSongToPriorityQueue(song) }}
                        />
                        <Divider />
                    </Fragment>
                ))}
            </VStack>
        </Box>
    )
}

const SongItemView = ({ song, playSong, isCurrentlyPlaying, removeSong, isUpdating, addSongToPriorityQueue }: { song: GenericTrack, playSong: () => void, isCurrentlyPlaying: boolean, removeSong: () => void, isUpdating: boolean, addSongToPriorityQueue: () => void }) => {
    const [songIsHovered, setSongIsHovered] = useState(false)

    return (
        <HStack justifyContent="space-between" w="100%" onMouseEnter={() => { setSongIsHovered(true) }} onMouseLeave={() => { setSongIsHovered(false) }}>
            <HStack>
                <Box position="relative">
                    <Flex w="100%" h="100%" position="absolute" justifyContent="center" alignItems="center">
                        <Tooltip label="Play song" openDelay={500}>

                            <IconButton
                                hidden={!songIsHovered}
                                aria-label="play song"
                                variant="ghost"
                                onClick={playSong}
                                icon={<FaPlay />}
                            />
                        </Tooltip>
                    </Flex>
                    <Image src={song.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} minW="4em" w="4em" borderRadius="lg" alt="cover art" />
                </Box>
                <VStack alignItems="start">
                    <Tooltip label={song.title} openDelay={1000}>
                        <Text fontWeight="bold" noOfLines={1} color={isCurrentlyPlaying ? "cyan.300" : "white"}>{song.title}</Text>
                    </Tooltip>
                    <Text color="gray.400" noOfLines={1}>{song.artists.join(", ")}</Text>
                </VStack>
            </HStack>
            {songIsHovered || isUpdating ? (
                <Menu>
                    <Tooltip label="More options" openDelay={500}>
                        <MenuButton
                            as={IconButton}
                            aria-label='Options'
                            borderRadius="full"
                            icon={!isUpdating ? (<BsThreeDots />) : (<Spinner />)}
                            isDisabled={isUpdating}
                            variant='ghost'
                        />
                    </Tooltip>
                    <MenuList>
                        <MenuItem icon={<FaOutdent />} onClick={addSongToPriorityQueue}>
                            Add to Queue
                        </MenuItem>
                        <MenuItem icon={<DeleteIcon />} onClick={removeSong}>
                            Remove
                        </MenuItem>

                    </MenuList>
                </Menu>
            ) : null}
        </HStack>
    )
}

export default QueueView