import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from '/components/Experience.jsx'
import App from './App'
import React from 'react'
import { PlayProvider } from './contexts/Play'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <React.StrictMode>
        <PlayProvider>
            <App />
        </PlayProvider>
    </React.StrictMode>
)