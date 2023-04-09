import React from 'react';
import { IconButton, Avatar, Box, Flex, HStack, useColorModeValue, Text, FlexProps, Menu, MenuButton, MenuDivider, MenuItem, MenuList, useDisclosure, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FiMenu, FiChevronDown } from 'react-icons/fi';
import SearchModal from './SearchModal';
import { SearchIcon } from '@chakra-ui/icons';
import { FullPlaylist } from './PlaylistView';

const DEFAULT_PROFILE_IMAGE_URL = "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"

interface MobileProps extends FlexProps {
    onOpen: () => void;
    userDetails: { displayName: string, imageUrl?: string } | undefined,
    currentPlaylist?: FullPlaylist,
    refreshCurrentPlaylist: () => {}
}
export const DashboardTopbar = ({ onOpen, userDetails, currentPlaylist, refreshCurrentPlaylist, ...rest }: MobileProps) => {

    const { isOpen: searchIsOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure();

    return (
        <Flex
            ml={{ base: '0', md: '60' }}
            px={4}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between' }}
            position="relative"
            {...rest}>

            <SearchModal onClose={onSearchClose} isOpen={searchIsOpen} currentPlaylist={currentPlaylist} refreshCurrentPlaylist={refreshCurrentPlaylist} />

            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold"
                position="absolute"
                minW="100%"
                justifyContent="center"
                left="0"
            >
                mixo.
            </Text>

            <InputGroup display={{ base: 'none', md: 'flex' }} maxW="30em" cursor="text" onClick={onSearchOpen}>
                <InputLeftElement pointerEvents='none'>
                    <SearchIcon />
                </InputLeftElement>
                <Input placeholder="Search for songs" tabIndex={-1} style={{ pointerEvents: "none" }} />
            </InputGroup>

            <HStack spacing={{ base: '0', md: '6' }}>
                <Flex alignItems={'center'}>
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        onClick={onSearchOpen}
                        variant="ghost"
                        aria-label="open search"
                        mr="1"
                        icon={<SearchIcon />}
                    />
                    {userDetails ? (
                        <Menu>
                            <MenuButton
                                py={2}
                                ml={4}
                                transition="all 0.3s"
                                _focus={{ boxShadow: 'none' }}>
                                <HStack>
                                    <Avatar
                                        size={'sm'}
                                        src={userDetails.imageUrl ?? DEFAULT_PROFILE_IMAGE_URL}
                                    />
                                    <Text fontSize="sm" display={{ base: 'none', md: 'flex' }}>{userDetails.displayName}</Text>
                                    <Box display={{ base: 'none', md: 'flex' }}>
                                        <FiChevronDown />
                                    </Box>
                                </HStack>
                            </MenuButton>
                            <MenuList>
                                <MenuItem>Settings</MenuItem>
                                <MenuDivider />
                                <MenuItem>Sign out</MenuItem>
                            </MenuList>
                        </Menu>
                    ) : null}
                </Flex>
            </HStack>
        </Flex>
    );
};
