import { StrictMode, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './stores/store'
import { initUser } from './stores/authUserSlice'

// TwicPics Components importation
import { installTwicpics } from "@twicpics/components/react"

import "@progress/kendo-theme-default/dist/all.css"
import './index.css'
import "@twicpics/components/style.css"
import TheNavbar from './components/TheNavbar'
import TheDrawer from './components/TheDrawer'
import TheAlerts from './components/TheAlerts'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from "./graphql/apolloClient"
import { Provider } from "react-redux"
import { store } from './stores/store'

// TwicPics Components configuration (see Setup Options)
installTwicpics( {
  // domain is mandatory
  domain: `${import.meta.env.VITE_TWICPICS_URL}`
} );

const authPages = ["/login", "/logout"];
const commonPages = ["/auth/callback"];

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.authenticated);

  useEffect(() => {
    dispatch(initUser());
  }, [dispatch]);

  useEffect(() => {
    if (commonPages.includes(location.pathname)) return;

    const idToken = localStorage.getItem("id_token");
    const idUser = localStorage.getItem("id_user");

    if (!idToken || !idUser) {
      if (!authPages.includes(location.pathname)) 
        navigate("/login");
    } else if (authPages.includes(location.pathname) || location.pathname === "/") {
      navigate("/boards");
    }
  }, [isAuthenticated, location, navigate]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <TheNavbar />
      <TheDrawer />
      <TheAlerts />
    </Suspense>
  )
}

const app = createRoot(document.getElementById('root')!)

app.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <App />
        </ApolloProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
