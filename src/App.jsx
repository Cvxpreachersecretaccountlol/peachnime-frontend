import AdMavenOnly from "./components/AdMavenOnly";
import AppContent from "./AppContent";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <AdMavenOnly />
      <AppContent />
    </AuthProvider>
  );
};

export default App;
