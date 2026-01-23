import { AuthProvider } from './context/AuthContext';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Root from "./pages/Root";
import DetailPage from "./pages/DetailPage";
import WatchPage from "./pages/WatchPage";
import ListPage from "./pages/ListPage";
import SearchResult from "./pages/SearchResult";
import CharactersPage from "./pages/CharactersPage";
import CharacterInfoPage from "./pages/CharacterInfoPage";
import PeopleInfoPage from "./pages/PeopleInfoPage";
import PageNotFound from "./pages/PageNotFound";
import ProfilePage from "./pages/ProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <PageNotFound />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/anime/:id",
    element: <DetailPage />,
  },
  {
    path: "/watch/:id",
    element: <WatchPage />,
  },
  {
    path: "/animes/:type",
    element: <ListPage />,
  },
  {
    path: "/search",
    element: <SearchResult />,
  },
  {
    path: "/characters",
    element: <CharactersPage />,
  },
  {
    path: "/character/:id",
    element: <CharacterInfoPage />,
  },
  {
    path: "/people/:id",
    element: <PeopleInfoPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
]);

const AppContent = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default AppContent;
