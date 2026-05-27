import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import api from "./api";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddVenue from "./pages/AddVenue";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import "./App.css";

function App() {
  const [venues, setVenues] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [venueError, setVenueError] = useState("");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const stored = localStorage.getItem("favoriteVenues");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bookings")) || [];
    } catch {
      return [];
    }
  });
  const pendingConfirmTimers = useRef({});
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  const showToast = useCallback((message, variant = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      delete toastTimers.current[id];
    }, 2600);
    toastTimers.current[id] = timeout;
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const persistBookings = useCallback((updater) => {
    setBookings((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("bookings", JSON.stringify(next));
      return next;
    });
  }, []);

  const scheduleAutoConfirm = useCallback(
    (bookingId, delay = 2500) => {
      if (pendingConfirmTimers.current[bookingId]) return;
      pendingConfirmTimers.current[bookingId] = setTimeout(() => {
        let updatedBooking = null;
        persistBookings((prev) =>
          prev.map((booking) => {
            if (booking.bookingId === bookingId && booking.status === "Pending") {
              updatedBooking = { ...booking, status: "Confirmed" };
              return updatedBooking;
            }
            return booking;
          })
        );
        if (updatedBooking) {
          showToast("Booking confirmed ✅", "success");
        }
        delete pendingConfirmTimers.current[bookingId];
      }, delay);
    },
    [persistBookings, showToast]
  );

  useEffect(() => {
    return () => {
      Object.values(pendingConfirmTimers.current).forEach((timer) => clearTimeout(timer));
      Object.values(toastTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    bookings
      .filter((booking) => booking.status === "Pending")
      .forEach((booking) => scheduleAutoConfirm(booking.bookingId));
  }, [bookings, scheduleAutoConfirm]);

  useEffect(() => {
    if (!token) {
      setVenues([]);
      return;
    }

    setIsLoadingVenues(true);
    setVenueError("");

    api
      .get("/venues", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setVenues(res.data);
      })
      .catch((err) => {
        console.error(err);
        setVenueError("We couldn't load venues right now. Please try again.");
      })
      .finally(() => {
        setIsLoadingVenues(false);
      });
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const handleAuthSuccess = ({ token: authToken, user: authUser }) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setVenues([]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleToggleFavorite = (venueId) => {
    let action = null;
    setFavoriteIds((prev) => {
      const exists = prev.includes(venueId);
      action = exists ? "removed" : "added";
      const updated = exists ? prev.filter((id) => id !== venueId) : [...prev, venueId];
      localStorage.setItem("favoriteVenues", JSON.stringify(updated));
      return updated;
    });
    if (action) {
      showToast(action === "added" ? "Added to favourites ❤️" : "Removed from favourites", "info");
    }
  };

  const handleBookingCreated = (booking) => {
    const normalizedBooking = { ...booking, status: "Pending" };
    persistBookings((prev) => [normalizedBooking, ...prev]);
    scheduleAutoConfirm(normalizedBooking.bookingId);
    showToast("Booking requested ⏳", "success");
  };

  const handleCancelBooking = (bookingId) => {
    if (pendingConfirmTimers.current[bookingId]) {
      clearTimeout(pendingConfirmTimers.current[bookingId]);
      delete pendingConfirmTimers.current[bookingId];
    }
    persistBookings((prev) => prev.filter((booking) => booking.bookingId !== bookingId));
    showToast("Booking cancelled ❌", "warning");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onAuthSuccess={handleAuthSuccess} />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register onAuthSuccess={handleAuthSuccess} />
            )
          }
        />

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route
            element={
              <AppLayout
                user={user}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            }
          >
            <Route
              index
              element={
                <Home
                  venues={venues}
                  favorites={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  isLoading={isLoadingVenues}
                  error={venueError}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <Home
                  venues={venues}
                  favorites={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  isLoading={isLoadingVenues}
                  error={venueError}
                  initialShowFavorites
                />
              }
            />
            <Route path="/add-venue" element={<AddVenue />} />
            <Route path="/book" element={<Booking venues={venues} onBookingCreated={handleBookingCreated} />} />
            <Route path="/bookings" element={<MyBookings bookings={bookings} onCancelBooking={handleCancelBooking} />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.variant}`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        ))}
      </div>
    </Router>
  );
}

export default App;
