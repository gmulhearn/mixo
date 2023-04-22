import React, { ReactNode } from 'react';
import { Box, useColorModeValue, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';
import { DashboardTopbar } from './DashboardTopbar';
import { DashboardPlaylistSidebar, SidebarPlaylistMetadata } from './DashboardPlaylistSidebar';
import { FullPlaylist } from './PlaylistView';

export default function DashboardFrame({
    children,
    userDetails,
    playlistsMetadata,
    setCurrentPlaylistId,
    currentPlaylist,
    refreshCurrentPlaylist,
    refreshPlaylists,
    
}: {
    children: ReactNode;
    userDetails: { displayName: string, imageUrl?: string } | undefined,
    playlistsMetadata?: SidebarPlaylistMetadata[],
    setCurrentPlaylistId: (id?: string) => void,
    currentPlaylist?: FullPlaylist,
    refreshCurrentPlaylist: () => {},
    refreshPlaylists: () => {},
}) {
    const { isOpen: drawerIsOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure();

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <DashboardPlaylistSidebar
                onCloseDrawer={() => {}}
                playlistsMetadata={playlistsMetadata}
                setCurrentPlaylistId={setCurrentPlaylistId}
                refreshPlaylists={refreshPlaylists}
                currentPlaylistId={currentPlaylist?.id}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer
                autoFocus={false}
                isOpen={drawerIsOpen}
                placement="left"
                onClose={onCloseDrawer}
                returnFocusOnClose={false}
                onOverlayClick={onCloseDrawer}
                size="full">
                <DrawerContent>
                    <DashboardPlaylistSidebar onCloseDrawer={onCloseDrawer} playlistsMetadata={playlistsMetadata} setCurrentPlaylistId={setCurrentPlaylistId} refreshPlaylists={refreshPlaylists} currentPlaylistId={currentPlaylist?.id} />
                </DrawerContent>
            </Drawer>
            {/* mobilenav */}
            <DashboardTopbar onOpen={onOpenDrawer} userDetails={userDetails} currentPlaylist={currentPlaylist} refreshCurrentPlaylist={refreshCurrentPlaylist} />
            <Box ml={{ base: 0, md: 60 }} p="4">
                {children}
            </Box>
        </Box>
    );
}