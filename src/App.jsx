import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import WatchPage from './pages/WatchPage';
import SearchResult from './pages/SearchResult';
import CharactersPage from './pages/CharactersPage';
import CharacterInfoPage from './pages/CharacterInfoPage';
import PeopleInfoPage from './pages/PeopleInfoPage';
import PageNotFound from './pages/PageNotFound';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/animes/:type" element={<ListPage />} />
          <Route path="/anime/:id" element={<DetailPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/character/:id" element={<CharacterInfoPage />} />
          <Route path="/people/:id" element={<PeopleInfoPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
