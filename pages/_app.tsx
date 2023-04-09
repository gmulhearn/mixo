import { trpc } from '@/core/appTrpc'
import theme from '@/styles/theme'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps, AppType } from 'next/app'

const App: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default trpc.withTRPC(App)