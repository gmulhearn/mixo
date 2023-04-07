import { getSpotifyAuthUrl } from '@/core/spotifyAPI'
import { Button, Flex, Link } from '@chakra-ui/react'
import React from 'react'

const Login = () => {
    return (
        <Flex w="100%" h="100vh" justifyContent="center" alignItems="center">
            <Link href={getSpotifyAuthUrl()}>
                <Button _hover={{
                    bg: 'cyan.400'
                }} color="white" fontWeight="bold">
                    login
                </Button>
            </Link>
        </Flex >
    )
}

export default Login