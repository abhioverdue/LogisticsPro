
class CourierDashboard {
  constructor() {
    this.orders = [];
    this.init();
  }

  async init() {
    try {
      if (!Utils.getAuthToken()) {
        window.location.href = '../login.html';
        return;
      }
      await this.loadUserInfo();
      await this.loadOrders();
      await this.loadStats();
      this.setupEventListeners();
    } catch (error) {
      console.error('Initialization failed:', error);
      Utils.showNotification('Failed to load dashboard. Please refresh the page.', 'error');
    }
  }

  setupEventListeners() {
    const updateStatusForm = document.getElementById('updateStatusForm');
    if (updateStatusForm) {
      updateStatusForm.addEventListener('submit', this.handleStatusUpdate.bind(this));
    }
  }

  async loadUserInfo() {
    const userInfo = Utils.getUserInfo();
    if (userInfo) {
      document.getElementById('userName').textContent = userInfo.email;
      document.getElementById('userAvatar').textContent = userInfo.email.charAt(0).toUpperCase();
    }
  }

  async loadOrders() {
    try {
      this.orders = await Utils.makeAPICall('/orders');
      this.displayOrders();
    } catch (error) {
      console.error('Failed to load orders:', error);
      Utils.showNotification('Failed to load orders.', 'error');
    }
  }

  displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (this.orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No assigned orders found</td></tr>';
      return;
    }

    tbody.innerHTML = this.orders.map(order => `
      <tr>
        <td><strong>${order.orderNumber}</strong></td>
        <td>${order.product.name}</td>
        <td>${this.formatRoute(order.shipping)}</td>
        <td><span class="status-badge status-${order.status.toLowerCase().replace('_', '-')}">${order.status.replace('_', ' ')}</span></td>
        <td>${this.getPriorityBadge(order)}</td>
        <td>${Utils.formatDate(order.shipping.estimatedDelivery)}</td>
        <td>
          <button onclick="courierDashboard.openUpdateStatusModal('${order.id}')" class="btn btn-primary" style="margin-right: 0.5rem;">Update</button>
          <button onclick="courierDashboard.viewRoute('${order.id}')" class="btn btn-secondary">Route</button>
        </td>
      </tr>
    `).join('');
  }

  formatRoute(shipping) {
    return `${shipping.from.city} → ${shipping.to.city}`;
  }

  getPriorityBadge(order) {
    const now = new Date();
    const delivery = new Date(order.shipping.estimatedDelivery);
    const hoursLeft = (delivery - now) / (1000 * 60 * 60);

    if (hoursLeft < 24) {
      return '<span class="status-badge" style="background: rgba(220, 38, 38, 0.1); color: #dc2626;">HIGH</span>';
    } else if (hoursLeft < 48) {
      return '<span class="status-badge" style="background: rgba(251, 191, 36, 0.1); color: #d97706;">MEDIUM</span>';
    } else {
      return '<span class="status-badge" style="background: rgba(34, 197, 94, 0.1); color: #16a34a;">LOW</span>';
    }
  }

  async loadStats() {
    if (this.orders.length === 0) return;

    const assignedOrders = this.orders.length;
    const inTransitOrders = this.orders.filter(order =>
      ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status)
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deliveredToday = this.orders.filter(order => {
      if (order.status !== 'DELIVERED') return false;
      const updatedDate = new Date(order.updatedAt);
      updatedDate.setHours(0, 0, 0, 0);
      return updatedDate.getTime() === today.getTime();
    }).length;

    document.getElementById('assignedOrders').textContent = assignedOrders;
    document.getElementById('inTransitOrders').textContent = inTransitOrders;
    document.getElementById('deliveredToday').textContent = deliveredToday;
    document.getElementById('avgDeliveryTime').textContent = '24h'; // Placeholder
  }

  async quickUpdateStatus() {
    const orderInput = document.getElementById('quickOrderId');
    const orderIdOrTracking = orderInput?.value?.trim();

    if (!orderIdOrTracking) {
      Utils.showNotification('Please enter an Order ID or Tracking Number.', 'warning');
      return;
    }

    const order = this.orders.find(o =>
      o.id === orderIdOrTracking ||
      o.orderNumber === orderIdOrTracking ||
      o.shipping.trackingNumber === orderIdOrTracking
    );

    if (order) {
      this.openUpdateStatusModal(order.id);
      orderInput.value = '';
    } else {
      Utils.showNotification('Order not found.', 'error');
    }
  }

  openUpdateStatusModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      Utils.showNotification('Order not found.', 'error');
      return;
    }
    document.getElementById('updateOrderId').value = orderId;
    document.getElementById('updateOrderNumber').value = order.orderNumber;
    document.getElementById('updateStatusModal').style.display = 'flex';
  }

  closeUpdateStatusModal() {
    document.getElementById('updateStatusModal').style.display = 'none';
    document.getElementById('updateStatusForm').reset();
  }

  async handleStatusUpdate(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    Utils.showLoading(submitBtn);

    try {
      const formData = new FormData(event.target);
      const orderId = document.getElementById('updateOrderId').value;

      const updateData = {
        status: formData.get('status'),
        location: formData.get('location') || 'In Transit',
        description: formData.get('description')
      };

      await Utils.makeAPICall(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      Utils.showNotification('Order status updated successfully!', 'success');
      this.closeUpdateStatusModal();
      await this.loadOrders();
      await this.loadStats();

    } catch (error) {
      Utils.showNotification('Failed to update order status.', 'error');
    } finally {
      Utils.hideLoading(submitBtn);
    }
  }

  // Single-order route (Leaflet)
  viewRoute(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      Utils.showNotification('Order not found.', 'error');
      return;
    }
    // Modal like TrackingManager
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Route Details - ${order.orderNumber}</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div style="padding:1.25rem;">
          <div id="delivery-map" style="height:450px;width:100%;border-radius:8px;border:1px solid #e5e7eb;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    setTimeout(() => this.initSingleOrderMap(order), 80);
  }

  initSingleOrderMap(order) {
    const el = document.getElementById('delivery-map');
    if (!el) return;

    const from = [
      order.shipping?.from?.latitude ?? 40.7589,
      order.shipping?.from?.longitude ?? -73.9851
    ];
    const to = [
      order.shipping?.to?.latitude ?? 34.0522,
      order.shipping?.to?.longitude ?? -118.2437
    ];

    const map = L.map('delivery-map').setView([(from[0]+to[0])/2, (from[1]+to[1])/2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19
    }).addTo(map);

    const iconA = L.divIcon({ className: 'custom-marker', html: '<div style="background:#2563eb;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-weight:bold;">A</div>', iconSize:[32,32], iconAnchor:[16,16] });
    const iconB = L.divIcon({ className: 'custom-marker', html: '<div style="background:#059669;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-weight:bold;">B</div>', iconSize:[32,32], iconAnchor:[16,16] });

    const mA = L.marker(from, { icon: iconA }).addTo(map).bindPopup('📦 Pickup Location');
    const mB = L.marker(to,   { icon: iconB }).addTo(map).bindPopup('🏠 Delivery Location');

    const line = L.polyline([from, to], { color:'#2563eb', weight:4, opacity:0.85 }).addTo(map);

    const group = L.featureGroup([mA, mB, line]);
    map.fitBounds(group.getBounds().pad(0.1));

    // Hidden-container safety
    setTimeout(() => map.invalidateSize(), 120);
  }

  // Multi-stop view/optimize (Leaflet)
  viewTodayRouteNonOptimized() {
    // same as optimizeRoute but keep natural order
    this.openMultiStopModal(false);
  }

  optimizeRoute() {
    // for now rely on same order; later replace order with backend-optimized sequence
    this.openMultiStopModal(true);
  }

  openMultiStopModal(optimize) {
    if (!this.orders.length) {
      Utils.showNotification('No orders to route.', 'warning');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${optimize ? 'Optimized Multi-Stop Route' : 'Today\'s Multi-Stop Route'}</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div style="padding:1.25rem;">
          <div id="optimized-route-map" style="height:500px;width:100%;border-radius:8px;border:1px solid #e5e7eb;"></div>
          <div id="optimized-route-info" style="text-align:center;margin-top:0.75rem;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    setTimeout(() => this.initMultiStopMap(optimize), 80);
  }

  initMultiStopMap(optimize) {
    const mapEl = document.getElementById('optimized-route-map');
    const infoEl = document.getElementById('optimized-route-info');
    if (!mapEl) return;

    // Build waypoint list: start = first pickup, then all deliveries
    const start = [
      this.orders[0]?.shipping?.from?.latitude ?? 20.5937,
      this.orders[0]?.shipping?.from?.longitude ?? 78.9629
    ];
    const stops = this.orders.map(o => [o.shipping?.to?.latitude, o.shipping?.to?.longitude])
      .filter(p => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1]));

    let sequence = [start, ...stops];

    // simple “optimization” placeholder (keep as-is; replace with backend order if available)
    // if (optimize) sequence = optimizedSequenceFromBackend || sequence;

    const map = L.map('optimized-route-map').setView(start, 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19
    }).addTo(map);

    // Markers
    const startMarker = L.marker(start).addTo(map).bindPopup('📦 Start (Pickup)');
    const deliveryMarkers = stops.map((p, i) =>
      L.marker(p).addTo(map).bindPopup(`🏠 Stop ${i+1} - ${this.orders[i]?.orderNumber || ''}`)
    );

    // Polyline
    const route = L.polyline(sequence, { color:'#16a34a', weight:4, opacity:0.85 }).addTo(map);

    const group = L.featureGroup([startMarker, route, ...deliveryMarkers]);
    map.fitBounds(group.getBounds().pad(0.1));

    const totalKm = this.totalPolylineDistance(sequence);
    const etaMin = this.estimateETA(totalKm);

    if (infoEl) {
      infoEl.innerHTML = `<strong>Total Distance:</strong> ${totalKm.toFixed(2)} km | <strong>Estimated Time:</strong> ${etaMin} min`;
    }

    setTimeout(() => map.invalidateSize(), 120);
  }

  totalPolylineDistance(points) {
    let d = 0;
    for (let i = 0; i < points.length - 1; i++) {
      d += this.calculateDistanceKm(points[i], points[i+1]);
    }
    return d;
  }

  // Haversine helpers (kept from your code)
  calculateDistanceKm(from, to) {
    const R = 6371;
    const dLat = (to[0]-from[0]) * Math.PI/180;
    const dLon = (to[1]-from[1]) * Math.PI/180;
    const lat1 = from[0] * Math.PI/180;
    const lat2 = to[0] * Math.PI/180;

    const a = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  estimateETA(distanceKm, avgSpeedKmH = 40) {
    return Math.round((distanceKm / avgSpeedKmH) * 60); // minutes
  }
}

// Global functions
function quickUpdateStatus(){ courierDashboard.quickUpdateStatus(); }
function loadOrders(){ courierDashboard.loadOrders(); }
function closeUpdateStatusModal(){ courierDashboard.closeUpdateStatusModal(); }
function viewRoute(){ // View today’s route (non-optimized UX using same modal)
  // reuse multi-stop modal without server optimization (placeholder)
  courierDashboard.viewTodayRouteNonOptimized();
}
function optimizeRoute(){ courierDashboard.optimizeRoute(); }
function logout(){
  if (window.authManager) window.authManager.logout();
  else { Utils.removeAuthToken(); window.location.href = '../login.html'; }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  window.courierDashboard = new CourierDashboard();
});
