import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.jsx'
import { pdfjs } from 'react-pdf'
import { ThemeProvider } from "@material-tailwind/react"

// IMPORTACIONES (CON ERROR MIME) - REVISAR
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
