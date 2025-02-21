import { ApolloClient, InMemoryCache, from, createHttpLink } from '@apollo/client';
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";

const httpLink = createHttpLink({
  uri: "https://uk.api.8base.com/cm3ynckg1000009jx85oo359h",
});
const removeTypenameLink = removeTypenameFromVariables();
const link = from([removeTypenameLink, httpLink]);
  
const cache = new InMemoryCache();
  
export const apolloClient = new ApolloClient({
  link,
  cache,
});
