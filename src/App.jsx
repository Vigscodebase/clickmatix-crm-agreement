import { Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router-dom';
import Agreement from './pages/agreement'
import PandaTemplate from "./pages/pandatemplate"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create-agreement" element={<Agreement />} />
        <Route path="/panda-create-template" element={<PandaTemplate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;