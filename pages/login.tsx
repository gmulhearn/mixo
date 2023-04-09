import { getSpotifyAuthUrl } from '@/core/spotifyAPI'
import { Button, Flex, HStack, Link, Text } from '@chakra-ui/react'
import React from 'react'
import { FaSpotify } from 'react-icons/fa'

const Login = () => {
    return (
        <Flex w="100%" h="100vh" justifyContent="center" alignItems="center">
            <Link href={getSpotifyAuthUrl()}>
                <Button _hover={{
                    bg: 'cyan.400'
                }} color="white" fontWeight="bold">
                    <HStack>
                        <FaSpotify />
                        <Text>Login with Spotify</Text>
                    </HStack>
                </Button>
            </Link>
        </Flex >
    )
}

export default Login