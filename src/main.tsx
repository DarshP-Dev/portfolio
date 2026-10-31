import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('The application root is missing.')
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
if (root.children.length > 0) hydrateRoot(root, app)
else createRoot(root).render(app)
