import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { AuthProvider } from './components/common/AuthProvider'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Provider>
  // </StrictMode>,
)
