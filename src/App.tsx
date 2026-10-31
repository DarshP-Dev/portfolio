import { Route, Routes } from 'react-router'
import { SiteShell } from './app/SiteShell'
import { HomePage } from './pages/HomePage'
import { ProjectPage } from './pages/ProjectPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <SiteShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SiteShell>
  )
}
