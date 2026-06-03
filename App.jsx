import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Agreement from './src/pages/agreement'

const App = () => {
    return (
        <Routes>
            <Route path="/agreement" element={<Agreement />} />
        </Routes>
    )
}

export default App;