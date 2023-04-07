import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Flex, Text } from '@chakra-ui/react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Mixo</title>
        <meta name="description" content="Mixo multi-streamer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex w="100%" justifyContent="center" minH="100%" alignItems="center" borderColor="red" borderWidth="1px">
        <Text>
          Hello!
        </Text>
      </Flex>
    </>
  )
}
