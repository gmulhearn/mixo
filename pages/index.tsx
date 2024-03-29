import Head from 'next/head'
import { Inter } from 'next/font/google'
import { Flex, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { push } = useRouter();

  useEffect(() => {
    push('/login');
  }, []);

  return (
    <>
      <Head>
        <title>Mixo</title>
        <meta name="description" content="Mixo multi-streamer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  )
}