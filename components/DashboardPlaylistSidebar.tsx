import React from 'react';
import { Box, CloseButton, Flex, useColorModeValue, Text, BoxProps, FlexProps, Button, Divider } from '@chakra-ui/react';

export interface SidebarPlaylistMetadata {
    id: string,
    name: string
}

interface SidebarProps extends BoxProps {
    onClose: () => void;
    playlistsMetadata: SidebarPlaylistMetadata[],
    onPlaylistItemClicked: (id: string) => void
}

export const DashboardPlaylistSidebar = ({ onClose, playlistsMetadata, onPlaylistItemClicked, ...rest }: SidebarProps) => {
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
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    mixo.
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {playlistsMetadata.map((playlist) => (
                <NavItem key={playlist.id} onClick={() => { onPlaylistItemClicked(playlist.id) }}>
                    {playlist.name}
                </NavItem>
            ))}
            <Divider my="4" />
            <NavItem justifyContent="center" bg='cyan.400' color='white' fontWeight="bold">
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