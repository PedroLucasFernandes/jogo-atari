import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Game from './components/Game';
import LoginButton from './components/LoginButton';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<LoginButton/>} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </Router>
    );
}

export default App;