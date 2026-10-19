import { AdminPage } from './pages/AdminPage';
import { GamePage } from './pages/GamePage';

function App() {
  const route = window.location.pathname;
  return route.startsWith('/admin') ? <AdminPage /> : <GamePage />;
}

export default App
