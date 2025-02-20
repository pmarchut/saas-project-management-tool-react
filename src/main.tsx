import routes from '~react-pages'
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import {
  BrowserRouter,
  useRoutes,
} from 'react-router-dom'

import './index.css'

import AppPageHeading from './components/AppPageHeading'

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AppPageHeading>
        Hello world!
      </AppPageHeading>
      {useRoutes(routes)}
    </Suspense>
  )
}

const app = createRoot(document.getElementById('root')!)

app.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
