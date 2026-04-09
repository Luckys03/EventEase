const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
];

const FRIENDLY_NOTES = [
  "Popular for college fests",
  "Most booked this month",
  "Great for late-night jam sessions",
  "Loved for convocation photos",
  "Faculty recommended venue",
  "Perfect for clubs and societies",
];

function VenueCard({ venue, onBook, onViewDetails, onToggleFavorite, isFavorite }) {
  const { name, city, address, capacity, pricePerDay, description } = venue;
  const quickFacts = [
    city,
    capacity ? `${capacity} guests` : null,
    pricePerDay ? `₹${pricePerDay.toLocaleString()}/day` : null,
  ].filter(Boolean);

  const numericId = Number(venue.id);
  const seed = Number.isFinite(numericId) ? numericId : (name?.length || 0) + (city?.length || 0);
  const fallbackImage = IMAGE_POOL[Math.abs(seed) % IMAGE_POOL.length];
  const imageUrl = venue.imageUrl || fallbackImage;
  const friendlyNote = FRIENDLY_NOTES[Math.abs(seed) % FRIENDLY_NOTES.length];

  return (
    <article className="venue-card interactive">
      <div className="card-media">
        <img src={imageUrl} alt={`${name} venue`} loading="lazy" />
        <div className="media-overlay">
          <span className="pill">{city}</span>
          {capacity && <span>{capacity} seats</span>}
        </div>
        <button
          type="button"
          className={`favorite-btn ${isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="venue-card__body">
        <div className="venue-card__header">
          <div>
            <p className="tag glow">Available</p>
            <h3>{name}</h3>
            <p className="venue-card__subtitle">{description || "Perfect for college fests, workshops, and meetups."}</p>
            <p className="friendly-note">{friendlyNote}</p>
          </div>
          <div className="price-pill neon">
            <span>Starting</span>
            <strong>{pricePerDay ? `₹${pricePerDay.toLocaleString()}` : "—"}</strong>
            <small>/day</small>
          </div>
        </div>

        <dl className="venue-card__details">
          <div>
            <dt>Location</dt>
            <dd>{city}</dd>
          </div>
          <div>
            <dt>Capacity</dt>
            <dd>{capacity ? `${capacity} people` : "—"}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{address}</dd>
          </div>
        </dl>

        <div className="chip-list">
          {quickFacts.map((fact) => (
            <span key={fact} className="chip floating">
              {fact}
            </span>
          ))}
        </div>

        <div className="venue-card__footer">
          <p className="muted">Instant confirmation for student events.</p>
          <div className="card-actions">
            <button
              type="button"
              className={`ghost-btn soft fav-toggle ${isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite?.()}
            >
              {isFavorite ? "Saved ❤️" : "Add to Favourite ❤️"}
            </button>
            <button type="button" className="ghost-btn soft" onClick={() => onViewDetails?.(venue)}>
              View details
            </button>
            <button type="button" className="primary-btn shimmer-btn" onClick={() => onBook?.(venue)}>
              Check availability
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default VenueCard;
