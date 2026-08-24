import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'
const AdminPage = lazy(() =>
  import('./pages/AdminPage.tsx').then((m) => ({ default: m.AdminPage })),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
