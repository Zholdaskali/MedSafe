import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'  // Это из react-redux
import './index.css'
import App from './App.jsx'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>  {/* Redux Provider */}
      <BrowserRouter>
        <App />  {/* Все приложение внутри */}
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
