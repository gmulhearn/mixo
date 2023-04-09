import { GenericTrack } from '@/server/routers/searchProcedures'
import { Avatar, HStack, Image, Text, useColorModeValue, VStack } from '@chakra-ui/react'
import React from 'react'
import { DEFAULT_COVER_ART_IMAGE } from './PlaylistView'

const PlayerFooter = ({ spotifyAccessToken, currentSong }: { spotifyAccessToken: string, currentSong?: GenericTrack }) => {
    return (
        <HStack position="fixed" w="100%" bottom="0"
            p="2"
            bg={useColorModeValue('white', 'gray.900')}
            borderTop="1px"
            borderTopColor={useColorModeValue('gray.200', 'gray.700')}
        >
            {currentSong ? (

                <HStack>
                    <Image src={currentSong.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} w="4em" borderRadius="lg" />
                    <VStack alignItems="start">
                        <Text fontWeight="bold" noOfLines={1}>{currentSong.title}</Text>
                        <Text color="gray.400" noOfLines={1}>{currentSong.artists.join(", ")}</Text>
                    </VStack>
                </HStack>
            ) : null}
            <div>PlayerFooter</div>
        </HStack>
    )
}

export default PlayerFooter