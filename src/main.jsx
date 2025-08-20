import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MyRouter from './router/Routers.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MyRouter />
  </StrictMode>,
)
