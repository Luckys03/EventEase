import { useEffect, useMemo, useState } from "react";
import BookingSummaryCard from "../components/BookingSummaryCard";

function MyBookings({ bookings = [], onCancelBooking }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const hasBookings = bookings && bookings.length > 0;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedBooking(null);
      }
    };

    if (selectedBooking) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBooking]);

  const handleCancel = (booking) => {
    if (!booking) return;
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      onCancelBooking?.(booking.bookingId);
      if (selectedBooking?.bookingId === booking.bookingId) {
        setSelectedBooking(null);
      }
    }
  };

  const bookingDetails = useMemo(() => {
    if (!selectedBooking) return null;
    const bookingDate = new Date(selectedBooking.bookingDate);
    const requestedDateLabel = selectedBooking.scheduledDate
      ? `${new Date(selectedBooking.scheduledDate).toLocaleDateString()} ${selectedBooking.scheduledTime || ""}`.trim()
      : "Awaiting slot";
    return {
      ...selectedBooking,
      bookingDateLabel: bookingDate.toLocaleString(),
      requestedDateLabel,
    };
  }, [selectedBooking]);

  const bookingSummary = useMemo(() => {
    if (!selectedBooking) return null;
    const statusTone = selectedBooking.status === "Confirmed" ? "confirmed" : "pending";
    return {
      venueName: selectedBooking.venueName,
      city: selectedBooking.city || "Across India",
      capacityLabel: selectedBooking.capacity ? `${selectedBooking.capacity} guests` : "Flexible seating",
      priceLabel: selectedBooking.pricePerDay ? `₹${selectedBooking.pricePerDay.toLocaleString()}` : "Custom quote",
      bookingDateLabel: selectedBooking.scheduledDate
        ? `${new Date(selectedBooking.scheduledDate).toLocaleDateString()} ${selectedBooking.scheduledTime || ""}`.trim()
        : "Awaiting slot",
      statusLabel: selectedBooking.status,
      statusTone,
    };
  }, [selectedBooking]);

  return (
    <section className="page">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">Your timeline</p>
          <h1>My Bookings</h1>
          <p className="muted">Every request you log from the demo flow shows up here for a quick teacher walkthrough.</p>
        </div>
      </header>

      {!hasBookings && (
        <div className="panel empty-state">
          <h3>No bookings yet</h3>
          <p className="muted">Tap “Check availability” on any venue to confirm the flow and see it listed here.</p>
        </div>
      )}

      {hasBookings && (
        <div className="venue-grid">
          {bookings.map((booking) => {
            const bookingDate = new Date(booking.bookingDate);
            const statusClass = `status-pill ${booking.status === "Confirmed" ? "confirmed" : "pending"}`;
            return (
              <article key={booking.bookingId} className="venue-card booking-card">
                <header className="venue-card__header">
                  <div>
                    <p className={statusClass}>{booking.status}</p>
                    <h3>{booking.venueName}</h3>
                    <p className="muted">{booking.city || "Across India"}</p>
                  </div>
                  <div className="price-pill neon">
                    <span>Per day</span>
                    <strong>{booking.pricePerDay ? `₹${booking.pricePerDay.toLocaleString()}` : "Custom"}</strong>
                  </div>
                </header>
                <dl className="venue-card__details">
                  <div>
                    <dt>Booking date</dt>
                    <dd>{bookingDate.toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt>Event</dt>
                    <dd>{booking.eventName || "Campus event"}</dd>
                  </div>
                  <div>
                    <dt>Capacity</dt>
                    <dd>{booking.capacity ? `${booking.capacity} guests` : "Flexible"}</dd>
                  </div>
                </dl>
                <div className="card-actions">
                  <button type="button" className="ghost-btn soft" onClick={() => setSelectedBooking(booking)}>
                    View details
                  </button>
                  <button type="button" className="ghost-btn danger" onClick={() => handleCancel(booking)}>
                    Cancel booking ❌
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {bookingDetails && (
        <div className="detail-modal" role="dialog" aria-modal="true" onClick={() => setSelectedBooking(null)}>
          <div className="detail-card" onClick={(event) => event.stopPropagation()}>
            <button className="ghost-btn close-btn" type="button" onClick={() => setSelectedBooking(null)}>
              Close
            </button>
            <h3>{bookingDetails.venueName}</h3>
            <p className="muted">{bookingDetails.city || "Across India"}</p>
            <p className={`status-pill ${bookingDetails.status === "Confirmed" ? "confirmed" : "pending"}`}>
              {bookingDetails.status}
            </p>
            {bookingSummary && <BookingSummaryCard summary={bookingSummary} compact />}
            <ul className="booking-details">
              <li>
                <strong>Booking ID:</strong> {bookingDetails.bookingId}
              </li>
              <li>
                <strong>Address:</strong> {bookingDetails.address || "Provided on confirmation"}
              </li>
              <li>
                <strong>Capacity:</strong> {bookingDetails.capacity ? `${bookingDetails.capacity} seats` : "Flexible"}
              </li>
              <li>
                <strong>Price/day:</strong> {bookingDetails.pricePerDay ? `₹${bookingDetails.pricePerDay.toLocaleString()}` : "Custom"}
              </li>
              <li>
                <strong>Requested by:</strong> {bookingDetails.organizer || "Student coordinator"}
              </li>
              <li>
                <strong>Event:</strong> {bookingDetails.eventName || "Campus showcase"}
              </li>
              <li>
                <strong>Requested slot:</strong> {bookingDetails.requestedDateLabel}
              </li>
              <li>
                <strong>Booking logged:</strong> {bookingDetails.bookingDateLabel}
              </li>
            </ul>
            {bookingDetails.notes && (
              <p className="muted">
                <strong>Notes:</strong> {bookingDetails.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default MyBookings;
