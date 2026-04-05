# PRD

# PRD: FlexiRoute – Dynamic Logistics Optimization System

## 1. Product Vision

**FlexiRoute** is an intelligent resource management platform designed to solve the problem of rigid supply chains. It enables logistics companies to re-route and re-allocate resources (fuel, goods, supplies) in real-time based on fluctuating demand, ensuring that critical needs are met first.

---

## 2. Target Audience

- **Logistics Dispatchers:** Need a bird’s-eye view of the supply chain to approve re-calculations.
- **Warehouse Operators:** Need a simple, rugged interface to manage outgoing stock.
- **Point-of-Delivery Managers:** Need to send “Urgent” requests when stock hits critical lows.

---

## 3. Problem Statement

Traditional logistics plans are static. If a “Point A” suddenly needs twice the fuel while a “Point B” has a surplus, current systems cannot easily divert the shipment mid-route. This leads to:
1. **Stockouts** in high-demand areas.
2. **Resource Waste** in low-demand areas.
3. **Financial Losses** due to inefficient mileage.

---

## 4. Functional Requirements

### 4.1 MVP (Core Features)

- **Live Inventory Dashboard:** Real-time visualization of stock levels across all delivery points.
- **Dynamic Re-calculation Engine:** An algorithm that suggests moving resources from “Low Priority/High Stock” points to “High Priority/Low Stock” points.
- **Tri-Level Prioritization:**
    - **Level 1 (Normal):** Routine replenishment.
    - **Level 2 (Elevated):** Stock will run out in < 6 hours.
    - **Level 3 (Critical):** Immediate stockout; operational stoppage.
- **Urgent Request Trigger:** A “One-Tap” button for managers to signal a crisis.
- **Data Security:** JWT-based authentication and encrypted payloads for sensitive resource data.

### 4.2 Innovation & Advanced Features (Bonus Points)

- **Offline-First Sync:** Using **Service Workers (PWA)** to allow warehouse staff to scan and confirm loads without a stable 4G/Wi-Fi connection.
- **P2P Resource Sharing:** A feature that shows the nearest *other* delivery point that has a surplus, allowing for local “borrowing” instead of waiting for the main warehouse.

---

## 5. Technical Stack (Proposed)

- **Frontend:** React.js / Next.js (Tailwind CSS for mobile-first responsiveness).
- **Backend:** Django REST framework.
- **Database:** SQLite (MVP) / PostgreSQL (Phase 2). Від Redis відмовилися на користь оптимізованих запитів (ORM annotate)
- **Logic:** A custom **Priority Weighting Algorithm**:
    
    $$
    Score = (DemandRatio \times PriorityMultiplier) + TimeSinceLastDelivery
    $$
    

---

## 6. User Experience (UX) Goals

- **Warehouse Usability:** High-contrast UI, large buttons for gloved hands, and barcode scanning support.
- **Clarity:** Use color coding (Red = Critical, Yellow = Warning, Green = OK) to minimize cognitive load for dispatchers.

---

## 7. Success Metrics (KPIs)

- **Re-allocation Speed:** System must calculate a new distribution plan in under 3 seconds.
- **Fulfillment Rate:** Increase the percentage of “Critical” requests met within the first 2 hours.
- **Connectivity Resilience:** Zero data loss during offline-to-online transitions.

---

## 8. Roadmap & Scalability

1. **Phase 1:** Manual approval of re-calculations by a dispatcher (Current Hackathon Scope).
2. **Phase 2:** AI-driven predictive demand (forecasting shortages before they happen).
3. **Phase 3:** Autonomous vehicle/Drone integration for small-batch urgent deliveries.