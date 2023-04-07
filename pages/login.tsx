import { getSpotifyAuthUrl } from '@/core/spotifyAPI'
import { Button, Flex, Link } from '@chakra-ui/react'
import React from 'react'

const Login = () => {
    return (
        <Flex w="100%" justifyContent="center">
            <Link href={getSpotifyAuthUrl()}>
                <Button>
                    Login
                </Button>
            </Link>
        </Flex>
    )
}

export default Login