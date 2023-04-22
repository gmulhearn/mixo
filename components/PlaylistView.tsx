import { trpc } from '@/core/appTrpc'
import { GenericTrack } from '@/server/routers/searchProcedures'
import { CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import { BsThreeDots } from 'react-icons/bs'
import { Box, Divider, Flex, Heading, HStack, IconButton, Image, Input, InputGroup, InputRightElement, Menu, MenuButton, MenuItem, MenuList, Spinner, Text, Tooltip, VStack } from '@chakra-ui/react'
import React, { Fragment, useState } from 'react'
import { FaEdit, FaOutdent, FaPlay } from "react-icons/fa"

export const DEFAULT_COVER_ART_IMAGE = "TODO"

export interface FullPlaylist {
    id: string,
    name: string,
    songs: { song: GenericTrack, addedEpochMs: number }[]
}

const PlaylistView = ({ playlist, playSong, currentSong, refreshCurrentPlaylist, refreshPlaylists, addSongToPriorityQueue }: { playlist: FullPlaylist, playSong: (song: GenericTrack, indexInPlaylist?: number) => void, currentSong?: GenericTrack, refreshCurrentPlaylist: () => void, refreshPlaylists: () => void, addSongToPriorityQueue: (song: GenericTrack) => void }) => {

    const [updatingSongs, setUpdatingSongs] = useState<GenericTrack[]>([])

    const [playlistNameIsHovered, setPlaylistNameIsHovered] = useState(false)
    const [isEditingPlaylistName, setIsEditingPlaylistName] = useState(false)
    const [newPlaylistNameInput, setNewPlaylistNameInput] = useState("")
    const [playlistNameIsUpdating, setPlaylistNameIsUpdating] = useState(false)

    const { mutateAsync: removeSongFromPlaylist } = trpc.removeSongFromPlaylist.useMutation()
    const { mutateAsync: editPlaylist } = trpc.editPlaylist.useMutation()

    const editPlaylistNameClicked = () => {
        setNewPlaylistNameInput(playlist.name)
        setIsEditingPlaylistName(true)
    }

    const saveNewPlaylistNameClicked = async () => {
        const formattedPlaylistName = newPlaylistNameInput.trim()

        if (formattedPlaylistName.length === 0) return
        setPlaylistNameIsUpdating(true)
        try {
            await editPlaylist({ playlistId: playlist.id, newPlaylistName: formattedPlaylistName })
            refreshCurrentPlaylist()
            refreshPlaylists()
        } catch { }
        setPlaylistNameIsUpdating(false)

        setIsEditingPlaylistName(false)
    }

    const deleteSongFromPlaylist = async (song: GenericTrack) => {
        setUpdatingSongs((currentSongs) => [...currentSongs, song])
        try {
            await removeSongFromPlaylist({ playlistId: playlist.id, song })
            refreshCurrentPlaylist()
        } catch (e) { }
        setUpdatingSongs((currentSongs) => currentSongs.filter((s) => s.platformSpecificId != song.platformSpecificId))
    }


    return (
        <Box w="100%">
            <HStack onMouseEnter={() => { setPlaylistNameIsHovered(true) }} onMouseLeave={() => setPlaylistNameIsHovered(false)}>
                {isEditingPlaylistName ? (<>
                    <InputGroup>
                        <InputRightElement>
                            {playlistNameIsUpdating ? (
                                <Spinner />
                            ) : (
                                <HStack mr="8">
                                    <IconButton
                                        aria-label="save"
                                        size="xs"
                                        onClick={saveNewPlaylistNameClicked}
                                        icon={<CheckIcon />}
                                    />
                                    <IconButton
                                        aria-label="cancel"
                                        size="xs"
                                        onClick={() => { setIsEditingPlaylistName(false) }}
                                        icon={<CloseIcon />}
                                    />
                                </HStack>
                            )}
                        </InputRightElement>
                        <Input
                            value={newPlaylistNameInput}
                            onKeyDown={(e) => { if (e.key == "Enter") { saveNewPlaylistNameClicked() } }}
                            onChange={(e) => { setNewPlaylistNameInput(e.target.value) }}
                            disabled={playlistNameIsUpdating}
                        />
                    </InputGroup>
                </>) : (
                    <>
                        <Heading>{playlist.name}</Heading>
                        {playlistNameIsHovered ? (
                            <Tooltip label="Edit playlist name" openDelay={500}>
                                <IconButton
                                    aria-label="change playlist name"
                                    variant="ghost"
                                    onClick={editPlaylistNameClicked}
                                    icon={<FaEdit />}
                                />
                            </Tooltip>
                        ) : null}
                    </>
                )}
            </HStack>
            <Divider my="4" />
            <VStack mx="4" mb="16">
                {playlist.songs.map((song, index) => (
                    <Fragment key={song.song.platformSpecificId}>
                        <SongItemView
                            song={song.song}
                            playSong={() => { playSong(song.song, index) }}
                            isCurrentlyPlaying={currentSong?.platformSpecificId == song.song.platformSpecificId}
                            removeSong={() => { deleteSongFromPlaylist(song.song) }}
                            isUpdating={updatingSongs.find((s) => s.platformSpecificId === song.song.platformSpecificId) !== undefined}
                            addSongToPriorityQueue={() => { addSongToPriorityQueue(song.song) }}
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

export default PlaylistView