import { Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router-dom';
import Agreement from './pages/agreement'
import PandaTemplate from "./pages/pandatemplate"
import PandaDocument from "./pages/pandadocument"
import Login from "./pages/login"
import Usermanagement from "./pages/Usermanagement"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create-agreement" element={<Agreement />} />
        <Route path="/panda-create-template" element={<PandaTemplate />} />
        <Route path="/panda-create-document" element={<PandaDocument />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-management" element={<Usermanagement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;