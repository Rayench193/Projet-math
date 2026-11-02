import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-title">
        Etude Math
      </div>

      <div className="navbar-links">

        <Link to="/">📊 Dashboard</Link>

        <Link to="/eleves">👨‍🎓 Élèves</Link>

        <Link to="/groupes">👥 Groupes</Link>

        <Link to="/sessions">📚 Séances</Link>

        <Link to="/presence">✅ Présence</Link>

        <Link to="/paiements">💰 Paiements</Link>

        <Link to="/livres">
  📚 Livres
</Link>
      </div>

    </nav>
  );
}

export default Navbar;