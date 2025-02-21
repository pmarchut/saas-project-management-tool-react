import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import graphql from '@rollup/plugin-graphql'
import tailwindcss from '@tailwindcss/vite'
import Pages from 'vite-plugin-pages'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    graphql(),
    tailwindcss(),
    Pages(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
})
