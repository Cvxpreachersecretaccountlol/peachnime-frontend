import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Root from "./pages/Root";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import useSidebarStore from "./store/sidebarStore";
import ListPage from "./pages/ListPage";
import DetailPage from "./pages/DetailPage";
import ScrollToTop from "./utils/ScrollToTop";
import SearchResult from "./pages/SearchResult";
import WatchPage from "./pages/WatchPage";
import PageNotFound from "./pages/PageNotFound";
import PeopleInfoPage from "./pages/PeopleInfoPage";
import CharacterInfoPage from "./pages/CharacterInfoPage";
import CharactersPage from "./pages/CharactersPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ContinueWatchingPage from "./pages/ContinueWatchingPage";
import HistoryPage from "./pages/HistoryPage";
import MyListPage from "./pages/MyListPage";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const AppContent = () => {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const location = useLocation();

  return (
    <AuthProvider>
      <ScrollToTop />
      <div className={`${isSidebarOpen ? "active" : ""}`}>
        <Header />
        <Sidebar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Root />} />
              <Route path="/home" element={<Home />} />
              <Route path="/anime/:id" element={<DetailPage />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/animes/:type" element={<ListPage />} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/characters/:id" element={<CharactersPage />} />
              <Route path="/character/:id" element={<CharacterInfoPage />} />
              <Route path="/people/:id" element={<PeopleInfoPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/continue-watching" 
                element={
                  <ProtectedRoute>
                    <ContinueWatchingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-list" 
                element={
                  <ProtectedRoute>
                    <MyListPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Public Routes */}
              <Route path="/profile/:userId" element={<PublicProfilePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
};

export default AppContent;
