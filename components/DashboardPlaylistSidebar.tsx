import React, { ReactNode, useState } from 'react';
import { Box, CloseButton, Flex, useColorModeValue, Text, BoxProps, FlexProps, Divider, useDisclosure, Center, Spinner, IconButton, Modal, ModalOverlay, ModalContent, VStack, Button } from '@chakra-ui/react';
import NewPlaylistModal from './NewPlaylistModal';
import { CloseIcon } from '@chakra-ui/icons';
import { trpc } from '@/core/appTrpc';

export interface SidebarPlaylistMetadata {
    id: string,
    name: string
}

interface SidebarProps extends BoxProps {
    onClose: () => void;
    playlistsMetadata: SidebarPlaylistMetadata[] | undefined,
    setCurrentPlaylistId: (id?: string) => void,
    refreshPlaylists: () => void,
    currentPlaylistId?: string
}

export const DashboardPlaylistSidebar = ({ onClose, playlistsMetadata, setCurrentPlaylistId, refreshPlaylists, currentPlaylistId, ...rest }: SidebarProps) => {
    const { isOpen: newPlaylistIsOpen, onOpen: onNewPlaylistOpen, onClose: onNewPlaylistClose } = useDisclosure();

    const [hoveredPlaylistId, setHoveredPlaylistId] = useState<string | undefined>(undefined)
    const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | undefined>(undefined)

    return (
        <Box
            transition="3s ease"
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}>
            <DeleteConfirmationPlaylistModal
                playlistId={deletingPlaylistId}
                onClose={() => { setDeletingPlaylistId(undefined) }}
                onDeleteSuccess={() => {
                    if (currentPlaylistId === deletingPlaylistId) {
                        setCurrentPlaylistId(undefined)
                    }
                }}
                refreshPlaylists={refreshPlaylists}
            />
            <NewPlaylistModal isOpen={newPlaylistIsOpen} onClose={onNewPlaylistClose} refreshPlaylists={refreshPlaylists} setCurrentPlaylistId={setCurrentPlaylistId} />
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    mixo.
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {playlistsMetadata ? (playlistsMetadata.map((playlist) => (
                <NavItem key={playlist.id} onClick={() => { setCurrentPlaylistId(playlist.id) }}
                    onMouseEnter={() => { setHoveredPlaylistId(playlist.id) }}
                    onMouseLeave={() => { setHoveredPlaylistId(undefined) }}
                    fontWeight={playlist.id === currentPlaylistId ? "bold" : "normal"}
                >
                    <Flex alignItems="center" justifyContent="space-between" w="100%">
                        <Text noOfLines={1}>
                            {playlist.name}
                        </Text>
                        {hoveredPlaylistId === playlist.id ? (
                            <IconButton
                                variant="unstyled"
                                px="1"
                                minW="0" h="100%"
                                aria-label="delete playlist"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setDeletingPlaylistId(playlist.id)
                                }}
                                icon={<CloseIcon fontSize="xs" />}
                            />
                        ) : (<></>)}

                    </Flex>
                </NavItem>
            ))) : (
                <Center>
                    <Spinner />
                </Center>
            )}
            <Divider my="4" />
            <NavItem justifyContent="center" bg='cyan.400' color='white' fontWeight="bold" onClick={onNewPlaylistOpen}>
                New Playlist
            </NavItem>
        </Box>
    );
};

interface NavItemProps extends FlexProps {
    children: ReactNode;
}
const NavItem = ({ children, ...rest }: NavItemProps) => {
    return (

        <Flex
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            _hover={{
                bg: 'cyan.400',
                color: 'white',
            }}
            {...rest}>
            {children}
        </Flex>
    );
};

const DeleteConfirmationPlaylistModal = ({ playlistId, onClose, refreshPlaylists, onDeleteSuccess }: { playlistId?: string, onClose: () => void, refreshPlaylists: () => void, onDeleteSuccess: () => void }) => {

    const { mutateAsync: deletePlaylist } = trpc.deletePlaylist.useMutation({})
    const [deleteLoading, setDeleteLoading] = useState(false)

    const deletePlaylistClicked = async () => {
        if (!playlistId) return
        setDeleteLoading(true)
        try {
            await deletePlaylist({ playlistId: playlistId })
            refreshPlaylists()
        } catch (e) { }

        setDeleteLoading(false)
        onDeleteSuccess()
        onClose()
    }

    return (
        <Modal isOpen={playlistId !== undefined} onClose={onClose}>
            <ModalOverlay />
            <ModalContent mx="2">
                <VStack mx="4" my="4" spacing="4">
                    <Text>Are you sure want to delete this playlist?</Text>
                    <Button w="100%" isLoading={deleteLoading} bg="cyan.400" _hover={{ bg: "cyan-400" }} onClick={deletePlaylistClicked}>I'm sure!</Button>
                </VStack>
            </ModalContent>
        </Modal>
    )
}