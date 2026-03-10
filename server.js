import 'dotenv/config'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import express from 'express'
import app from './app.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Serve built frontend in local production mode
const DIST_DIR = join(__dirname, 'dist')
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('/{*path}', (req, res) => res.sendFile(join(DIST_DIR, 'index.html')))
}

const PORT = process.env.SERVER_PORT || 3002
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))
