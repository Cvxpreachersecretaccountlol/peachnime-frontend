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
import { AuthProvider } from './context/AuthContext';

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
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/character/:id" element={<CharacterInfoPage />} />
              <Route path="/people/:id" element={<PeopleInfoPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
};

export default AppContent;
