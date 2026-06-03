import { Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router-dom';
import Agreement from './pages/agreement'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/agreement" element={<Agreement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;