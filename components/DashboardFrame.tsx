import React, { ReactNode } from 'react';
import { Box, useColorModeValue, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';
import { DashboardTopbar } from './DashboardTopbar';
import { DashboardPlaylistSidebar, SidebarPlaylistMetadata } from './DashboardPlaylistSidebar';
import { FullPlaylist } from './PlaylistView';

export default function DashboardFrame({
    children,
    userDetails,
    playlistsMetadata,
    onPlaylistItemClicked,
    currentPlaylist,
    refreshCurrentPlaylist,
    refreshPlaylists,
    
}: {
    children: ReactNode;
    userDetails: { displayName: string, imageUrl?: string } | undefined,
    playlistsMetadata?: SidebarPlaylistMetadata[],
    onPlaylistItemClicked: (id: string) => void,
    currentPlaylist?: FullPlaylist,
    refreshCurrentPlaylist: () => {},
    refreshPlaylists: () => {},
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <DashboardPlaylistSidebar
                onClose={() => onClose}
                playlistsMetadata={playlistsMetadata}
                onPlaylistItemClicked={onPlaylistItemClicked}
                refreshPlaylists={refreshPlaylists}
                currentPlaylistId={currentPlaylist?.id}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full">
                <DrawerContent>
                    <DashboardPlaylistSidebar onClose={onClose} playlistsMetadata={playlistsMetadata} onPlaylistItemClicked={onPlaylistItemClicked} refreshPlaylists={refreshPlaylists} />
                </DrawerContent>
            </Drawer>
            {/* mobilenav */}
            <DashboardTopbar onOpen={onOpen} userDetails={userDetails} currentPlaylist={currentPlaylist} refreshCurrentPlaylist={refreshCurrentPlaylist} />
            <Box ml={{ base: 0, md: 60 }} p="4">
                {children}
            </Box>
        </Box>
    );
}