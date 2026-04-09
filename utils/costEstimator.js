/**
 * AI-Based Cost Estimator for EventEase
 * 
 * This module provides a rule-based cost estimation system for event bookings.
 * The estimation considers:
 * 1. Base venue cost (per day)
 * 2. Number of guests
 * 3. Event duration
 * 4. Additional services (catering, decoration, etc.)
 */

// Service configurations with base prices and per-guest rates
const SERVICES = {
  catering: {
    basePrice: 5000,      // Base price for catering
    perGuest: 300,        // Per guest cost
    description: 'Basic catering service (food and non-alcoholic beverages)'
  },
  decoration: {
    basePrice: 3000,      // Base price for decoration
    perGuest: 100,        // Per guest cost for additional decoration
    description: 'Basic venue decoration with seating arrangements'
  },
  photography: {
    basePrice: 8000,      // Fixed price for photography
    description: '6 hours of professional photography service'
  },
  soundSystem: {
    basePrice: 4000,      // Fixed price for sound system
    description: 'Basic sound system with 2 speakers and microphone'
  }
};

/**
 * Calculate total cost for a booking
 * @param {Object} params - Booking parameters
 * @param {number} params.basePrice - Base price per day of the venue
 * @param {number} params.guestCount - Number of guests
 * @param {number} params.duration - Duration in days
 * @param {string[]} [params.services=[]] - Array of selected service keys
 * @returns {Object} - Object containing cost breakdown and total
 */
const estimateCost = ({ basePrice, guestCount, duration, services = [] }) => {
  // Validate inputs
  if (!basePrice || !guestCount || !duration) {
    throw new Error('Missing required parameters for cost estimation');
  }

  // 1. Calculate base venue cost
  const venueCost = basePrice * duration;
  
  // 2. Calculate service costs
  let servicesCost = 0;
  const servicesBreakdown = [];
  
  services.forEach(serviceKey => {
    const service = SERVICES[serviceKey];
    if (service) {
      let serviceTotal = service.basePrice || 0;
      
      // Add per-guest cost if applicable
      if (service.perGuest) {
        serviceTotal += guestCount * service.perGuest;
        
        // Apply bulk discount for large events
        if (guestCount > 100) {
          serviceTotal *= 0.9; // 10% discount for large events
        }
      }
      
      servicesCost += serviceTotal;
      servicesBreakdown.push({
        name: serviceKey,
        description: service.description,
        cost: serviceTotal
      });
    }
  });

  // 3. Apply seasonal pricing (example: 20% higher in December)
  const isPeakSeason = new Date().getMonth() === 11; // December
  const seasonalMultiplier = isPeakSeason ? 1.2 : 1;
  
  // 4. Calculate total cost
  const subtotal = (venueCost + servicesCost) * seasonalMultiplier;
  
  // 5. Apply early bird discount (5% if booking > 30 days in advance)
  const bookingDate = new Date();
  const eventDate = new Date(bookingDate);
  eventDate.setDate(eventDate.getDate() + 31); // Example: event is 31 days from now
  
  const daysInAdvance = Math.ceil((eventDate - bookingDate) / (1000 * 60 * 60 * 24));
  const earlyBirdDiscount = daysInAdvance > 30 ? 0.05 : 0;
  
  const discountAmount = subtotal * earlyBirdDiscount;
  const total = subtotal - discountAmount;

  return {
    costBreakdown: {
      venue: {
        basePrice,
        duration,
        total: venueCost
      },
      services: servicesBreakdown,
      seasonalMultiplier: isPeakSeason ? 1.2 : 1,
      earlyBirdDiscount: earlyBirdDiscount * 100 + '%',
      discountAmount
    },
    subtotal: parseFloat(subtotal.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    currency: 'INR',
    estimationDate: new Date().toISOString()
  };
};

module.exports = {
  estimateCost,
  getAvailableServices: () => Object.keys(SERVICES).map(key => ({
    id: key,
    ...SERVICES[key]
  }))
};
