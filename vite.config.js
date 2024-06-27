import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_MY_API_KEY': JSON.stringify(env.REACT_APP_MY_API_KEY)
    },
    plugins: [react()],
  }
})

