function BookingSummaryCard({ title = "Booking summary", summary = {}, className = "", compact = false }) {
  const {
    venueName = "Select a venue",
    city = "—",
    capacityLabel = "Add details",
    priceLabel = "Custom quote",
    bookingDateLabel = "Pick a date",
    statusLabel = "Draft",
    statusTone = "draft",
  } = summary;

  const toneClass =
    statusTone === "confirmed" ? "confirmed" : statusTone === "warning" ? "warning" : statusTone === "pending" ? "pending" : "draft";

  return (
    <article className={`booking-summary-card panel ${compact ? "compact" : ""} ${className}`.trim()} aria-live="polite">
      <header className="summary-header">
        <div>
          <p className="eyebrow subtle">{title}</p>
          <h3>{venueName}</h3>
          <p className="muted">{city}</p>
        </div>
        <span className={`status-pill ${toneClass}`}>{statusLabel}</span>
      </header>
      <dl className="summary-grid">
        <div>
          <dt>Capacity</dt>
          <dd>{capacityLabel}</dd>
        </div>
        <div>
          <dt>Price per day</dt>
          <dd>{priceLabel}</dd>
        </div>
        <div>
          <dt>Booking date</dt>
          <dd>{bookingDateLabel}</dd>
        </div>
      </dl>
    </article>
  );
}

export default BookingSummaryCard;
