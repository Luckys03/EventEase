import { useState } from "react";
import api from "../api";

function AddVenue() {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    capacity: "",
    pricePerDay: "",
    description: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    try {
      await api.post(
        "/venues",
        {
          ...formData,
          capacity: Number(formData.capacity) || undefined,
          pricePerDay: Number(formData.pricePerDay) || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus({ type: "success", message: "Venue submitted for review." });
      setFormData({ name: "", city: "", address: "", capacity: "", pricePerDay: "", description: "" });
    } catch (err) {
      setStatus({ type: "error", message: "Could not save venue. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Add a new venue</h1>
          <p className="muted">Share the basics — capacity, pricing, and a quick blurb.</p>
        </div>
      </header>

      {status.message && (
        <div className={`alert ${status.type === "success" ? "success" : "error"}`}>
          {status.message}
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            <span>Venue name</span>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Auditorium" required />
          </label>
          <label>
            <span>City</span>
            <input name="city" value={formData.city} onChange={handleChange} placeholder="Bengaluru" required />
          </label>
          <label>
            <span>Address</span>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Block A, Campus Road" required />
          </label>
          <label>
            <span>Capacity</span>
            <input
              name="capacity"
              type="number"
              min="0"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="500"
            />
          </label>
          <label>
            <span>Price per day (₹)</span>
            <input
              name="pricePerDay"
              type="number"
              min="0"
              value={formData.pricePerDay}
              onChange={handleChange}
              placeholder="15000"
            />
          </label>
        </div>

        <label>
          <span>Description</span>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Notes about ambience, A/V gear, accessibility..."
          />
        </label>

        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save venue"}
        </button>
      </form>
    </section>
  );
}

export default AddVenue;
