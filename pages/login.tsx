import { getSpotifyAuthUrl } from '@/core/spotifyAPI'
import { Button, Flex, HStack, Link, Text, VStack } from '@chakra-ui/react'
import Head from 'next/head'
import React from 'react'
import { FaSpotify } from 'react-icons/fa'

const Login = () => {
    return (
        <>
            <Head>
                <title>Mixo - Login</title>
                <meta name="description" content="Mixo streamer" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Flex w="100%" h="100vh" justifyContent="center" alignItems="center">
                <VStack spacing="8">
                    <Text
                        fontSize="2xl"
                        fontFamily="monospace"
                        fontWeight="bold"
                    >
                        mixo.
                    </Text>
                    <Link href={getSpotifyAuthUrl()}>
                        <Button _hover={{
                            bg: 'cyan.400'
                        }} color="white" fontWeight="bold">
                            <HStack>
                                <FaSpotify />
                                <Text>Login</Text>
                            </HStack>
                        </Button>
                    </Link>
                </VStack>
            </Flex >
        </>
    )
}

export default Login