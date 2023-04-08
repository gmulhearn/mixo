import React from 'react';
import { Box, CloseButton, Flex, useColorModeValue, Text, BoxProps, FlexProps, Divider, useDisclosure, Center, Spinner } from '@chakra-ui/react';
import NewPlaylistModal from './NewPlaylistModal';

export interface SidebarPlaylistMetadata {
    id: string,
    name: string
}

interface SidebarProps extends BoxProps {
    onClose: () => void;
    playlistsMetadata: SidebarPlaylistMetadata[] | undefined,
    onPlaylistItemClicked: (id: string) => void,
    refreshPlaylists: () => void,
    currentPlaylistId?: string
}

export const DashboardPlaylistSidebar = ({ onClose, playlistsMetadata, onPlaylistItemClicked, refreshPlaylists, currentPlaylistId, ...rest }: SidebarProps) => {
    const { isOpen: newPlaylistIsOpen, onOpen: onNewPlaylistOpen, onClose: onNewPlaylistClose } = useDisclosure();

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
            <NewPlaylistModal isOpen={newPlaylistIsOpen} onClose={onNewPlaylistClose} refreshPlaylists={refreshPlaylists} />
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    mixo.
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {playlistsMetadata ? (playlistsMetadata.map((playlist) => (
                <NavItem key={playlist.id} onClick={() => { onPlaylistItemClicked(playlist.id) }}
                    fontWeight={playlist.id === currentPlaylistId ? "bold" : "normal"}
                >
                    {playlist.name}
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
    children: string;
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