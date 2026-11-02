import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';

import Dashboard from './pages/dashboard/Dashboard';
import Sessions from './pages/sessions/Sessions';
import Presence from './pages/presence/Presence';
import Paiements from './pages/paiements/Paiements';
import Eleves from './pages/eleves/Eleves';
import Groupes from './pages/groupes/Groupes';
import SeancesEleve from './pages/eleves/SeancesEleve';
import Livres from './pages/livres/Livres';
import LivrePaiements from './pages/livres/LivrePaiements';
function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Élèves */}
        <Route
          path="/eleves"
          element={<Eleves />}
        />

        {/* Séances d'un élève */}
        <Route
          path="/eleves/:studentId/seances"
          element={<SeancesEleve />}
        />

        {/* Groupes */}
        <Route
          path="/groupes"
          element={<Groupes />}
        />

        {/* Séances */}
        <Route
          path="/sessions"
          element={<Sessions />}
        />

        {/* Présence */}
        <Route
          path="/presence"
          element={<Presence />}
        />

        {/* Paiements */}
        <Route
          path="/paiements"
          element={<Paiements />}
        />

<Route
  path="/livres"
  element={<Livres />}
/>

<Route
  path="/livres/:bookId/paiements"
  element={<LivrePaiements />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;