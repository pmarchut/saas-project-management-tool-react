import { ApolloClient, InMemoryCache, from, createHttpLink } from '@apollo/client';
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { store } from '@/stores/store';
import { logout } from '@/stores/authUserSlice';

const httpLink = createHttpLink({
  uri: "https://uk.api.8base.com/cm3ynckg1000009jx85oo359h",
});
const removeTypenameLink = removeTypenameFromVariables();
const link = from([removeTypenameLink, httpLink]);

// Authorization Link (bez używania hooków)
const setAuthorizationLink = setContext((_, { headers }) => {
  const state = store.getState(); // Pobieramy aktualny stan Redux
  const token = state.auth.idToken; // Pobieramy token z Redux

  return token
    ? {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      }
    : { headers };
});

// Error handling (bez hooków)
const setErrorHandler = onError(({ graphQLErrors }) => {
  const badToken = graphQLErrors?.some(
    (e) => e.extensions?.code === "TokenExpiredError" || e.extensions?.code === "InvalidTokenError"
  );

  if (badToken) {
    store.dispatch(logout()); // Dispatch bez `useDispatch`
  }
});
  
const cache = new InMemoryCache();
  
export const apolloClient = new ApolloClient({
  link: from([setAuthorizationLink, setErrorHandler, link]),
  cache,
});
