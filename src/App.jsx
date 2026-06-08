import { Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router-dom';
import Agreement from './pages/agreement'
import PandaTemplate from "./pages/pandatemplate"
import PandaDocument from "./pages/pandadocument"
import Login from "./pages/login"
import Register from "./pages/register"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create-agreement" element={<Agreement />} />
        <Route path="/panda-create-template" element={<PandaTemplate />} />
        <Route path="/panda-create-document" element={<PandaDocument />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;