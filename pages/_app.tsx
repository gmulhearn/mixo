import { trpc } from '@/core/appTrpc'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps, AppType } from 'next/app'

const App: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default trpc.withTRPC(App)