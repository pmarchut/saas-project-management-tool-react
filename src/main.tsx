import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'

// TwicPics Components importation
import { installTwicpics } from "@twicpics/components/react"

import "@progress/kendo-theme-default/dist/all.css"
import './index.css'
import "@twicpics/components/style.css"
import TheNavbar from './components/TheNavbar'
import TheDrawer from './components/TheDrawer'
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from "./graphql/apolloClient";

// TwicPics Components configuration (see Setup Options)
installTwicpics( {
  // domain is mandatory
  domain: `${import.meta.env.VITE_TWICPICS_URL}`
} );

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <TheNavbar />
      <TheDrawer />
    </Suspense>
  )
}

const app = createRoot(document.getElementById('root')!)

app.render(
  <StrictMode>
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </StrictMode>,
)
