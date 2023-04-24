import { trpc } from '@/core/appTrpc'
import { GenericTrack } from '@/server/routers/searchProcedures'
import { CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import { BsThreeDots } from 'react-icons/bs'
import { Box, Divider, Flex, Heading, HStack, IconButton, Image, Input, InputGroup, InputRightElement, Menu, MenuButton, MenuItem, MenuList, Spinner, StackProps, Text, Tooltip, VStack } from '@chakra-ui/react'
import React, { Fragment, useMemo, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FaEdit, FaOutdent, FaPlay } from "react-icons/fa"

export const DEFAULT_COVER_ART_IMAGE = "TODO"
export const PRIORITY_QUEUE_DROPPABLE_ID = "priority-queue"

export interface FullPlaylist {
    id: string,
    name: string,
    songs: { song: GenericTrack, addedEpochMs: number }[]
}

interface QueueViewProps {
    priorityQueue: { id: string, song: GenericTrack }[],
    playSong: (song: GenericTrack, index?: number) => void,
    addSongToPriorityQueue: (song: GenericTrack) => void,
    removeSongFromPriorityQueue: (index: number) => void
    currentQueue: GenericTrack[] | undefined,
    playingIndexInQueue: number | undefined,
}

const grid = 8;
const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
  
    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",
  
    // styles we need to apply on draggables
    ...draggableStyle
  });

const QueueView = ({ priorityQueue, playSong, addSongToPriorityQueue, currentQueue, playingIndexInQueue, removeSongFromPriorityQueue }: QueueViewProps) => {

    const mainQueueSongs: GenericTrack[] | undefined = useMemo(() => {
        if (currentQueue === undefined || playingIndexInQueue === undefined) return undefined
        return currentQueue.slice(playingIndexInQueue + 1)
    }, [currentQueue, playingIndexInQueue])

    const [ enabled, setEnabled ] = React.useState(false);

    React.useEffect(() => {
      const animation = requestAnimationFrame(() => setEnabled(true));
  
      return () => {
         cancelAnimationFrame(animation);
         setEnabled(false);
      };
    }, []);
  
    if (!enabled) {
        return null;
    }

    return (
        <Box w="100%">
            <Heading>Queue</Heading>
            <Divider my="4" />
            <Heading size='md'>Playing Next</Heading>
            <Divider my="4" />
            
                <Droppable droppableId={PRIORITY_QUEUE_DROPPABLE_ID}>
                    {(provided, snapshot) => (
                        <VStack mx="4" mb={"4"}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {priorityQueue.map((song, i) => (
                                <Draggable
                                    key={song.id}
                                    draggableId={song.id}
                                    index={i}>
                                    {(provided, snapshot) => (

                                        <VStack 
                                        w="100%"
                                        key={song.id}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                           
                                        >
                                            <SongItemView
                                                song={song.song}
                                                playSong={() => { playSong(song.song) }}  // TODO - playing here is dangerous... should i just disable playing?
                                                isCurrentlyPlaying={false}
                                                removeSongFromPriorityQueue={() => { removeSongFromPriorityQueue(i) }}
                                                isRemoveable={true}
                                                isUpdating={false}
                                                addSongToPriorityQueue={() => { addSongToPriorityQueue(song.song) }}
                                            />
                                            <Divider />
                                        </VStack>
                                    )}
                                </Draggable>
                            ))}
                            {priorityQueue.length === 0 ? (
                                <Text textAlign="left" w="100%" fontStyle="italic">Nothing queued...</Text>
                            ): null}
                            {provided.placeholder}
                        </VStack>
                    )}
                </Droppable>
            <Heading size='md'>Playing After</Heading>
            <Divider my="4" />
            <VStack mx="4" mb="16">
                {mainQueueSongs?.map((song) => (
                    <Fragment key={song.platformSpecificId}>
                        <SongItemView
                            song={song}
                            playSong={() => { playSong(song) }} // TODO - playing here is dangerous... should i just disable playing?
                            isCurrentlyPlaying={false}
                            isUpdating={false}
                            addSongToPriorityQueue={() => { addSongToPriorityQueue(song) }}
                            removeSongFromPriorityQueue={() => { }}
                            isRemoveable={false}

                        />
                        <Divider />
                    </Fragment>
                ))}
            </VStack>
        </Box>
    )
}

interface SongItemViewProps extends StackProps {
    song: GenericTrack,
    playSong: () => void,
    isCurrentlyPlaying: boolean,
    isUpdating: boolean,
    addSongToPriorityQueue: () => void,
    removeSongFromPriorityQueue: () => void,
    isRemoveable: boolean
};

// TODO - make SOngItemView generic for all screens
const SongItemView = ({ song, playSong, isCurrentlyPlaying, isUpdating, addSongToPriorityQueue, removeSongFromPriorityQueue, isRemoveable, ...rest }: SongItemViewProps) => {
    const [songIsHovered, setSongIsHovered] = useState(false)

    return (
        <HStack justifyContent="space-between" w="100%" onMouseEnter={() => { setSongIsHovered(true) }} onMouseLeave={() => { setSongIsHovered(false) }} {...rest}>
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
                        {isRemoveable ? (
                            <MenuItem icon={<DeleteIcon />} onClick={removeSongFromPriorityQueue}>
                                Remove from Queue
                            </MenuItem>
                        ) : null}

                    </MenuList>
                </Menu>
            ) : null}
        </HStack>
    )
}

export default QueueView