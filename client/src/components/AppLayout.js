import { NavLink, Outlet } from "react-router-dom";

function AppLayout({ user, onLogout, theme, onToggleTheme }) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            ✦
          </span>
          EventEase
        </div>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            My Favourites
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            My Bookings
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/add-venue"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Add Venue
            </NavLink>
          )}
          <button type="button" className="nav-link toggle" onClick={onToggleTheme}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
