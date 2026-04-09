import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import VenueCard from "../components/VenueCard";
import { galleryImages, mockVenues } from "../data/mockVenues";

const categoryOptions = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "music", label: "Music", emoji: "🎵" },
  { key: "nightlife", label: "Nightlife", emoji: "🌙" },
  { key: "arts", label: "Performing Arts", emoji: "🎭" },
  { key: "holidays", label: "Holidays", emoji: "🎉" },
  { key: "business", label: "Business", emoji: "💼" },
  { key: "food", label: "Food & Drink", emoji: "🍽️" },
  { key: "college", label: "College Events", emoji: "🎓" },
];
const categoryPool = categoryOptions.filter((option) => option.key !== "all");

const heroSlides = [
  {
    eyebrow: "College cultural events",
    titleLead: "Every",
    titleHighlight: "campus fest",
    titleTrail: "deserves a warm story",
    description: "Pair student-led programming with venues that already get the vibe—decor, audio, permissions and host support in one place.",
    primaryCta: "Plan cultural fest",
    secondaryCta: "Recommend a venue",
  },
  {
    eyebrow: "Hackathons & tech sprints",
    titleLead: "Power all-night",
    titleHighlight: "hackathons",
    titleTrail: "with hybrid-ready spaces",
    description: "Choose studios with blazing Wi-Fi, modular pods, mentor lounges, and 24x7 access for dev teams.",
    primaryCta: "Book hackathon floor",
    secondaryCta: "Add a tech venue",
  },
  {
    eyebrow: "DJ nights & concerts",
    titleLead: "Light up",
    titleHighlight: "concert-grade",
    titleTrail: "stages for your crew",
    description: "Outdoor arenas and rooftops with pro sound, safe dance floors, and power backups baked in.",
    primaryCta: "Plan a DJ night",
    secondaryCta: "Host a lineup",
  },
  {
    eyebrow: "Conferences & seminars",
    titleLead: "Curate inspiring",
    titleHighlight: "seminars",
    titleTrail: "with concierge-like venues",
    description: "Auditoriums and domes with streaming support, translation booths, and relaxed parent seating.",
    primaryCta: "Schedule conference",
    secondaryCta: "Share conference hall",
  },
];

function Home({ venues = [], favorites = [], onToggleFavorite, isLoading, error, initialShowFavorites = false }) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: "featured", order: "asc" });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(Boolean(initialShowFavorites));
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    document.body.style.overflow = selectedVenue ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedVenue]);

  useEffect(() => {
    setShowFavoritesOnly(Boolean(initialShowFavorites));
  }, [initialShowFavorites]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const mergedVenues = useMemo(() => {
    const combined = [...venues, ...mockVenues];
    const seen = new Map();

    combined.forEach((venue, index) => {
      const key = venue.id ?? `${venue.name || "venue"}-${venue.city || index}-${index}`;
      if (seen.has(key)) return;

      const fallbackImage = galleryImages[index % galleryImages.length];
      const categoryMeta = categoryPool[index % categoryPool.length];
      seen.set(key, {
        ...venue,
        id: key,
        city: venue.city || "Across India",
        description: venue.description || "Versatile venue for hackathons and cultural fests.",
        imageUrl: venue.imageUrl || fallbackImage,
        categoryKey: venue.categoryKey || categoryMeta.key,
        categoryLabel: venue.categoryLabel || categoryMeta.label,
        categoryEmoji: venue.categoryEmoji || categoryMeta.emoji,
      });
    });

    return Array.from(seen.values());
  }, [venues]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const filteredVenues = useMemo(() => {
    let result = [...mergedVenues];

    if (showFavoritesOnly) {
      result = result.filter((venue) => favoriteSet.has(venue.id));
    }

    if (activeCategory !== "all") {
      result = result.filter((venue) => (venue.categoryKey || "college") === activeCategory);
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((venue) => {
        const target = `${venue.name || ""} ${venue.city || ""}`.toLowerCase();
        return target.includes(normalizedQuery);
      });
    }

    return result;
  }, [mergedVenues, showFavoritesOnly, favoriteSet, activeCategory, searchQuery]);

  const sortedVenues = useMemo(() => {
    let result = [...filteredVenues];

    if (sortConfig.key === "price") {
      result.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
    } else if (sortConfig.key === "capacity") {
      result.sort((a, b) => (a.capacity || 0) - (b.capacity || 0));
    }

    if (sortConfig.order === "desc") {
      result.reverse();
    }

    return result;
  }, [filteredVenues, sortConfig]);

  const venueCount = mergedVenues.length;

  const averageCapacity = useMemo(() => {
    if (!venueCount) return 0;
    const total = mergedVenues.reduce((sum, venue) => sum + (venue.capacity || 0), 0);
    return Math.round(total / venueCount);
  }, [mergedVenues, venueCount]);

  const featuredCity = useMemo(() => mergedVenues[0]?.city || "Multiple cities", [mergedVenues]);

  const handleBook = (venue) => {
    navigate("/book", { state: { venueId: venue.id } });
  };

  const popularVenues = sortedVenues.slice(0, 4);
  const trendingVenues = sortedVenues.slice(4, 8);

  const handleSortChange = (type) => {
    setSortConfig((prev) => {
      if (prev.key === type) {
        return { key: type, order: prev.order === "asc" ? "desc" : "asc" };
      }
      return { key: type, order: "asc" };
    });
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
  };

  const insightCards = [
    {
      icon: "🎧",
      label: "A/V ready",
      value: "Dolby, hybrid streaming",
    },
    {
      icon: "🌿",
      label: "Eco compliant",
      value: "75% venues solar powered",
    },
    {
      icon: "⚡",
      label: "Quick approvals",
      value: "Avg 24 min confirmation",
    },
  ];

  return (
    <section className="page">
      <div className="hero-panel">
        <div className="hero-copy">
          <div className="hero-slider">
            {heroSlides.map((slide, index) => (
              <article key={slide.eyebrow} className={`hero-slide ${index === activeSlide ? "active" : ""}`}>
                <p className="eyebrow glow-text">{slide.eyebrow}</p>
                <h1>
                  {slide.titleLead} <span className="grad-text">{slide.titleHighlight}</span> {slide.titleTrail}
                </h1>
                <p className="muted">{slide.description}</p>
                <div className="hero-actions">
                  <button type="button" className="primary-btn cta-btn" onClick={() => navigate("/book")}>
                    {slide.primaryCta}
                  </button>
                  <button type="button" className="ghost-btn soft" onClick={() => navigate("/add-venue")}>
                    {slide.secondaryCta}
                  </button>
                </div>
              </article>
            ))}
            <div className="hero-dots" role="tablist" aria-label="Hero slide navigation">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.eyebrow}
                  type="button"
                  className={index === activeSlide ? "active" : ""}
                  aria-label={`Show slide: ${slide.eyebrow}`}
                  aria-selected={index === activeSlide}
                  role="tab"
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          </div>
          <div className="hero-badges">
            <span>✨ Flexible layouts for college shows</span>
            <span>🛰️ Updated by venue managers</span>
            <span>🛡️ Smooth approvals with faculty</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-glass">
            <p>Seats currently available</p>
            <h3>{averageCapacity || "—"} <small>per venue</small></h3>
            <div className="pulse-bar">
              <span style={{ width: `${Math.min(averageCapacity / 10, 100)}%` }} />
            </div>
            <p className="muted">Refreshed daily by host teams</p>
          </div>
          <div className="orbit" />
          <div className="orbit" />
        </div>
      </div>

      <div className="stat-row fancy">
        <article>
          <p className="muted">Active venues</p>
          <h2>{venueCount || "—"}</h2>
          <small>Verified for college events</small>
        </article>
        <article>
          <p className="muted">Average capacity</p>
          <h2>{averageCapacity || "—"}</h2>
          <small>Seats per venue</small>
        </article>
        <article>
          <p className="muted">Primary city</p>
          <h2>{featuredCity}</h2>
          <small>Based on latest data</small>
        </article>
      </div>

      <div className="insight-cards">
        {insightCards.map((card) => (
          <div key={card.label} className="insight-card">
            <span className="icon-pill">{card.icon}</span>
            <div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="category-strip" role="tablist" aria-label="Event categories">
        {categoryOptions.map((category) => (
          <button
            key={category.key}
            type="button"
            className={`category-pill ${activeCategory === category.key ? "active" : ""}`}
            onClick={() => setActiveCategory(category.key)}
            role="tab"
            aria-selected={activeCategory === category.key}
          >
            <span aria-hidden>{category.emoji}</span>
            {category.label}
          </button>
        ))}
      </div>

      <div className="search-bar" role="search">
        <label className="sr-only" htmlFor="venue-search">
          Search venues or city
        </label>
        <div className="search-input">
          <span className="search-icon" aria-hidden>
            🔍
          </span>
          <input
            id="venue-search"
            type="search"
            placeholder="Search venues or city..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="controls-bar">
        <div className="chip-toggle-group">
          {[
            { key: "featured", label: "Featured" },
            { key: "price", label: "Sort by price" },
            { key: "capacity", label: "Sort by capacity" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`ghost-btn soft ${sortConfig.key === key ? "active" : ""}`}
              onClick={() => handleSortChange(key)}
            >
              {label}
              {sortConfig.key === key && sortConfig.key !== "featured" && (
                <span className="sort-indicator">{sortConfig.order === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`ghost-btn soft favorites-toggle ${showFavoritesOnly ? "active" : ""}`}
          onClick={() => setShowFavoritesOnly((prev) => !prev)}
        >
          {showFavoritesOnly ? "Showing favorites" : "Show favorites"}
        </button>
      </div>

      {popularVenues.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Popular Venues</p>
              <h2>Sunlit terraces to starlit domes</h2>
              <p className="muted">Handpicked by coordinators for culturals, fests, and summits.</p>
            </div>
            <button type="button" className="ghost-btn soft" onClick={() => navigate("/book")}>See details</button>
          </div>

          <div className="venue-grid popular-grid">
            {popularVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onBook={handleBook}
                onViewDetails={handleViewDetails}
                onToggleFavorite={() => onToggleFavorite?.(venue.id)}
                isFavorite={favoriteSet.has(venue.id)}
              />
            ))}
          </div>
        </section>
      )}

      {trendingVenues.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Trending Event Locations</p>
              <h2>Destinations with a travel postcard vibe</h2>
              <p className="muted">Scroll through lakesides, rooftops, beaches, and heritage courtyards.</p>
            </div>
          </div>

          <div className="venue-scroller" aria-label="Trending venues">
            {trendingVenues.map((venue) => (
              <article
                key={`trend-${venue.id}`}
                className="trend-card"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55)), url(${venue.imageUrl})` }}
              >
                <div className="trend-card__content">
                  <p>{venue.city}</p>
                  <h3>{venue.name}</h3>
                  <div className="trend-badges">
                    <span>{venue.capacity ? `${venue.capacity} guests` : "Flexible setup"}</span>
                    <span>{venue.pricePerDay ? `₹${venue.pricePerDay.toLocaleString()}/day` : "Custom quote"}</span>
                  </div>
                  <div className="trend-actions">
                    <button type="button" className="ghost-btn light" onClick={() => handleViewDetails(venue)}>
                      View details
                    </button>
                    <button type="button" className="ghost-btn light" onClick={() => handleBook(venue)}>
                      Check availability
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {isLoading && <div className="panel shimmer">Loading venues…</div>}
      {error && <div className="alert error">{error}</div>}

      {!isLoading && !venueCount && (
        <div className="panel empty-state">
          <h3>No venues yet</h3>
          <p className="muted">Use “Add Venue” to build your first shortlist.</p>
        </div>
      )}

      <div className="section-heading subtle">
        <div>
          <p className="eyebrow">All venues</p>
          <h2>Explore every corner of EventEase</h2>
        </div>
      </div>

      <div className="venue-grid">
        {sortedVenues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onBook={handleBook}
            onViewDetails={handleViewDetails}
            onToggleFavorite={() => onToggleFavorite?.(venue.id)}
            isFavorite={favoriteSet.has(venue.id)}
          />
        ))}
      </div>

      {selectedVenue && (
        <div className="detail-modal" role="dialog" aria-modal="true">
          <div className="detail-card">
            <button className="ghost-btn close-btn" type="button" onClick={() => setSelectedVenue(null)}>
              Close
            </button>
            <img src={selectedVenue.imageUrl} alt={selectedVenue.name} />
            <h3>{selectedVenue.name}</h3>
            <p className="muted">{selectedVenue.city}</p>
            <p>
              {selectedVenue.capacity ? `${selectedVenue.capacity} seats • ` : ""}
              {selectedVenue.pricePerDay ? `₹${selectedVenue.pricePerDay.toLocaleString()}/day` : "Custom pricing"}
            </p>
            <p>{selectedVenue.description}</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                handleBook(selectedVenue);
                setSelectedVenue(null);
              }}
            >
              Start booking
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Home;
