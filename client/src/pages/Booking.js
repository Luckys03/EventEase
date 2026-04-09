import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mockVenues } from "../data/mockVenues";
import BookingSummaryCard from "../components/BookingSummaryCard";

function Booking({ venues = [], onBookingCreated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const incomingVenueId = location.state?.venueId ? String(location.state.venueId) : "";
  const [selectedVenueId, setSelectedVenueId] = useState(incomingVenueId);
  const [formData, setFormData] = useState({
    eventName: "",
    organizer: "",
    date: "",
    time: "",
    attendees: "",
    notes: "",
  });
  const [status, setStatus] = useState("");

  const mergedVenues = useMemo(() => {
    const combined = [...venues, ...mockVenues];
    const seen = new Map();
    combined.forEach((venue, index) => {
      const key = String(venue.id ?? index);
      if (seen.has(key)) return;
      seen.set(key, {
        ...venue,
        id: key,
        city: venue.city || "Across India",
        capacity: venue.capacity || null,
        pricePerDay: venue.pricePerDay || null,
      });
    });
    return Array.from(seen.values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [venues]);

  const selectedVenue = useMemo(() => {
    if (!selectedVenueId) return null;
    return mergedVenues.find((venue) => String(venue.id) === String(selectedVenueId));
  }, [selectedVenueId, mergedVenues]);

  useEffect(() => {
    if (incomingVenueId) {
      setSelectedVenueId(incomingVenueId);
    }
  }, [incomingVenueId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const bookingSummary = useMemo(() => {
    const capacityLabel = selectedVenue?.capacity ? `${selectedVenue.capacity} guests` : "Add capacity";
    const priceLabel = selectedVenue?.pricePerDay
      ? `₹${selectedVenue.pricePerDay.toLocaleString()}`
      : "Custom quote";
    const hasDate = Boolean(formData.date);
    const dateObject = hasDate ? new Date(formData.date) : null;
    const safeDate = dateObject && !Number.isNaN(dateObject.getTime()) ? dateObject.toLocaleDateString() : null;
    const hasTime = Boolean(formData.time);
    const bookingDateLabel = safeDate ? `${safeDate} ${hasTime ? formData.time : ""}`.trim() : "Pick date & time";

    let statusLabel = selectedVenue ? "Select details" : "Pick a venue";
    let statusTone = selectedVenue ? "draft" : "draft";
    if (selectedVenue && !safeDate) {
      statusLabel = "Select date";
      statusTone = "warning";
    } else if (selectedVenue && safeDate) {
      statusLabel = status === "sent" ? "Request sent" : "Ready to send";
      statusTone = "pending";
    }

    return {
      venueName: selectedVenue?.name || "Select a venue",
      city: selectedVenue?.city || "Across India",
      capacityLabel,
      priceLabel,
      bookingDateLabel,
      statusLabel,
      statusTone,
    };
  }, [selectedVenue, formData.date, formData.time, status]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedVenue) {
      setStatus("error");
      return;
    }

    const newBooking = {
      bookingId: `booking-${Date.now()}`,
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      city: selectedVenue.city,
      address: selectedVenue.address,
      capacity: selectedVenue.capacity,
      pricePerDay: selectedVenue.pricePerDay,
      bookingDate: new Date().toISOString(),
      status: "Pending",
      eventName: formData.eventName,
      organizer: formData.organizer,
      scheduledDate: formData.date,
      scheduledTime: formData.time,
      attendees: formData.attendees,
      notes: formData.notes,
    };

    onBookingCreated?.(newBooking);
    setStatus("sent");
    setFormData({ eventName: "", organizer: "", date: "", time: "", attendees: "", notes: "" });
  };

  return (
    <section className="page">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">Booking</p>
          <h1>Reserve a venue</h1>
          <p className="muted">Send a quick request — coordinators confirm slots within the day.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-btn" onClick={() => navigate("/")}>Back to venues</button>
        </div>
      </header>

      {status === "sent" && <div className="alert success">Booking request sent! Watch it turn green in “My Bookings”.</div>}

      <div className="booking-grid">
        <div className="panel">
          <label>
            <span className="muted">Choose a venue</span>
            <select value={selectedVenueId} onChange={(e) => setSelectedVenueId(e.target.value)}>
              <option value="">Select venue</option>
              {mergedVenues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} · {venue.city} {venue.capacity ? `(${venue.capacity} seats)` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="selected-venue">
            {selectedVenue ? (
              <>
                <h3>{selectedVenue.name}</h3>
                <p className="muted">{selectedVenue.city} · Capacity {selectedVenue.capacity || "—"}</p>
                <ul>
                  <li><strong>Address:</strong> {selectedVenue.address}</li>
                  <li><strong>Price/day:</strong> ₹{selectedVenue.pricePerDay?.toLocaleString?.() || "—"}</li>
                </ul>
                <p>
                  This is a read-only preview for the demo. Submitting the form triggers a confirmation alert
                  instead of a real booking.
                </p>
              </>
            ) : (
              <div className="empty-state">
                <h3>No venue selected</h3>
                <p className="muted">Pick one from the dropdown or go back to the dashboard.</p>
              </div>
            )}
          </div>

          <BookingSummaryCard summary={bookingSummary} />
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Event name</span>
              <input name="eventName" value={formData.eventName} onChange={handleChange} placeholder="Tech Symposium" required />
            </label>
            <label>
              <span>Organizer</span>
              <input name="organizer" value={formData.organizer} onChange={handleChange} placeholder="Student Council" required />
            </label>
            <label>
              <span>Date</span>
              <input name="date" type="date" value={formData.date} onChange={handleChange} required />
            </label>
            <label>
              <span>Start time</span>
              <input name="time" type="time" value={formData.time} onChange={handleChange} required />
            </label>
            <label>
              <span>Attendees</span>
              <input
                name="attendees"
                type="number"
                min="0"
                value={formData.attendees}
                onChange={handleChange}
                placeholder="300"
              />
            </label>
          </div>

          <label>
            <span>Notes / requirements</span>
            <textarea
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Stage lighting, AV support, catering, etc."
            />
          </label>

          <button type="submit" className="primary-btn">Send booking request</button>
        </form>
      </div>
    </section>
  );
}

export default Booking;
