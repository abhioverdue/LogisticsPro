class TrackingManager {
    constructor() {
        this.trackingInput = document.getElementById('trackingInput');
        this.trackingResult = document.getElementById('trackingResult');
        this.currentOrder = null; // Store current order
        this.init();
    }

    init() {
        // Add enter key listener for tracking input
        if (this.trackingInput) {
            this.trackingInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.trackOrder();
                }
            });
        }
    }

    async trackOrder() {
        const trackingNumber = this.trackingInput?.value?.trim();
        
        if (!trackingNumber) {
            Utils.showNotification('Please enter a tracking number.', 'warning');
            return;
        }

        if (!this.trackingResult) {
            console.error('Tracking result container not found');
            return;
        }

        try {
            this.showLoadingState();
            
            const response = await Utils.makeAPICall(`/tracking/public/${trackingNumber}`);
            this.displayTrackingResult(response);
            
        } catch (error) {
            this.displayError(error.message || 'Order not found. Please check your tracking number.');
        }
    }

    showLoadingState() {
        this.trackingResult.innerHTML = `
            <div class="tracking-loading">
                <div class="spinner"></div>
                <p>Tracking your order...</p>
            </div>
        `;
    }

    displayTrackingResult(order) {
        if (!order) {
            this.displayError('Order not found.');
            return;
        }

        // Store current order for map functionality
        this.currentOrder = order;

        const statusClass = order.status.toLowerCase().replace('_', '-');
        const timeline = order.timeline || [];
        
        this.trackingResult.innerHTML = `
            <div class="tracking-details">
                <div class="tracking-header">
                    <h3>Order ${order.orderNumber}</h3>
                    <span class="status-badge status-${statusClass}">${order.status.replace('_', ' ')}</span>
                </div>
                
                <div class="tracking-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Product:</label>
                            <span>${order.product.name}</span>
                        </div>
                        <div class="info-item">
                            <label>Courier Service:</label>
                            <span>${order.shipping.courierService}</span>
                        </div>
                        <div class="info-item">
                            <label>Estimated Delivery:</label>
                            <span>${Utils.formatDate(order.shipping.estimatedDelivery)}</span>
                        </div>
                        <div class="info-item">
                            <label>Total Value:</label>
                            <span>${Utils.formatCurrency(order.pricing.total)}</span>
                        </div>
                    </div>
                </div>

                <div class="tracking-timeline">
                    <h4>Tracking Timeline</h4>
                    <div class="timeline">
                        ${timeline.map((event, index) => `
                            <div class="timeline-item ${index === 0 ? 'active' : ''}">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-time">${Utils.formatDate(event.timestamp)}</div>
                                    <div class="timeline-status">${event.status.replace('_', ' ')}</div>
                                    <div class="timeline-description">${event.description}</div>
                                    ${event.location ? `<div class="timeline-location">📍 ${event.location}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Always show map button -->
                <div class="tracking-map">
                    <button onclick="trackingManager.showMap('${order.id || order._id}')" class="btn btn-primary">
                        🗺️ View Route on Map
                    </button>
                </div>
            </div>
        `;

        // Add custom styles for tracking
        this.addTrackingStyles();
    }

    displayError(message) {
        this.trackingResult.innerHTML = `
            <div class="tracking-error">
                <div class="error-icon">❌</div>
                <h3>Tracking Not Found</h3>
                <p>${message}</p>
                <button onclick="trackingManager.clearResults()" class="btn btn-secondary">
                    Try Again
                </button>
            </div>
        `;
    }

    clearResults() {
        this.trackingResult.innerHTML = '';
        this.trackingInput.value = '';
        this.trackingInput.focus();
        this.currentOrder = null;
    }

    addTrackingStyles() {
        if (document.getElementById('tracking-styles')) return;

        const styles = `
            <style id="tracking-styles">
                .tracking-details {
                    text-align: left;
                    padding: 1.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 0.75rem;
                    background: var(--surface-color);
                    margin-top: 1rem;
                }

                .tracking-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .tracking-header h3 {
                    margin: 0;
                    color: var(--text-primary);
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .info-item label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .info-item span {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .tracking-timeline h4 {
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }

                .timeline {
                    position: relative;
                    padding-left: 1.5rem;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 0.5rem;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--border-color);
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .timeline-marker {
                    position: absolute;
                    left: -1.25rem;
                    top: 0.25rem;
                    width: 1rem;
                    height: 1rem;
                    border-radius: 50%;
                    background: var(--border-color);
                }

                .timeline-item.active .timeline-marker {
                    background: var(--primary-color);
                }

                .timeline-content {
                    padding-left: 0.5rem;
                }

                .timeline-time {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }

                .timeline-status {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .timeline-description {
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }

                .timeline-location {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .tracking-error {
                    text-align: center;
                    padding: 2rem;
                }

                .error-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .tracking-error h3 {
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .tracking-error p {
                    color: var(--text-secondary);
                    margin-bottom: 1.5rem;
                }

                .tracking-loading {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-secondary);
                }

                .tracking-map {
                    margin-top: 1.5rem;
                    text-align: center;
                }

                /* Leaflet map modal styles */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }

                .modal-content {
                    background: white;
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    max-width: 90vw;
                    max-height: 90vh;
                    width: 800px;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.25rem;
                }

                .leaflet-container {
                    border-radius: 0.5rem;
                }

                @media (max-width: 768px) {
                    .tracking-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .modal-content {
                        width: 95vw;
                        padding: 1rem;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // FIXED: Use current order instead of fetching again
    async showMap(orderId) {
        try {
            if (this.currentOrder) {
                this.openMapModal(this.currentOrder);
            } else {
                Utils.showNotification('Unable to load map data. Please try tracking again.', 'error');
            }
        } catch (error) {
            console.error('Map error:', error);
            Utils.showNotification('Unable to load map data.', 'error');
        }
    }

    openMapModal(order) {
        // Load Leaflet if not already loaded
        if (typeof L === 'undefined') {
            this.loadLeaflet().then(() => {
                this.openMapModal(order);
            });
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🗺️ Delivery Route - ${order.orderNumber}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div id="delivery-map" style="height: 450px; width: 100%; border-radius: 0.5rem;"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize OpenStreetMap
        setTimeout(() => this.initDeliveryMap(order), 100);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async loadLeaflet() {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            document.head.appendChild(script);

            return new Promise((resolve, reject) => {
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load Leaflet'));
            });
        }
    }

    initDeliveryMap(order) {
        const mapContainer = document.getElementById('delivery-map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.error('Leaflet.js not loaded');
            mapContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 0.5rem;">
                    <div style="text-align: center; color: #6c757d;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                        <p>OpenStreetMap not available</p>
                        <p>Loading map library...</p>
                    </div>
                </div>
            `;
            return;
        }

        // Clear any existing map
        mapContainer.innerHTML = '';

        // Extract coordinates from order with fallbacks
        const fromCoords = [
            order.shipping?.from?.latitude || 40.7589, // Default to NYC
            order.shipping?.from?.longitude || -73.9851
        ];
        
        const toCoords = [
            order.shipping?.to?.latitude || 34.0522, // Default to LA
            order.shipping?.to?.longitude || -118.2437
        ];

        // Calculate center point
        const centerLat = (fromCoords[0] + toCoords[0]) / 2;
        const centerLng = (fromCoords[1] + toCoords[1]) / 2;

        // Initialize Leaflet map
        const map = L.map('delivery-map').setView([centerLat, centerLng], 6);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Custom icons using div icons
        const fromIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: #2563eb;
                color: white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                font-weight: bold;
                font-size: 16px;
                font-family: Arial, sans-serif;
            ">A</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const toIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: #059669;
                color: white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                font-weight: bold;
                font-size: 16px;
                font-family: Arial, sans-serif;
            ">B</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        // Add pickup marker
        const fromMarker = L.marker(fromCoords, { icon: fromIcon }).addTo(map);
        fromMarker.bindPopup(`
            <div style="padding: 8px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: #2563eb;">📦 Pickup Location</h4>
                <p style="margin: 0; font-size: 14px;">
                    ${order.shipping?.from?.street || 'Pickup Location'}<br>
                    ${order.shipping?.from?.city || 'New York'}, ${order.shipping?.from?.state || 'NY'} ${order.shipping?.from?.postalCode || '10001'}
                </p>
            </div>
        `);

        // Add delivery marker  
        const toMarker = L.marker(toCoords, { icon: toIcon }).addTo(map);
        toMarker.bindPopup(`
            <div style="padding: 8px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: #059669;">🏠 Delivery Location</h4>
                <p style="margin: 0; font-size: 14px;">
                    ${order.shipping?.to?.street || 'Delivery Location'}<br>
                    ${order.shipping?.to?.city || 'Los Angeles'}, ${order.shipping?.to?.state || 'CA'} ${order.shipping?.to?.postalCode || '90001'}
                </p>
            </div>
        `);

        // Draw route line with animation
        const routeLine = L.polyline([fromCoords, toCoords], {
            color: '#2563eb',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5'
        }).addTo(map);

        // Calculate distance
        const distance = this.calculateDistance(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
        const estimatedTime = Math.round(distance * 1.5); // Rough estimate: 1.5 min per km

        // Add route info control
        const routeInfo = L.control({ position: 'topright' });
        routeInfo.onAdd = function() {
            const div = L.DomUtil.create('div', 'route-info');
            div.innerHTML = `
                <div style="
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    min-width: 220px;
                    border: 1px solid #e5e7eb;
                ">
                    <div style="font-weight: bold; margin-bottom: 10px; color: #1f2937;">📋 Route Information</div>
                    <div style="margin-bottom: 6px;"><strong>Order:</strong> ${order.orderNumber}</div>
                    <div style="margin-bottom: 6px;"><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">${order.status.replace('_', ' ')}</span></div>
                    <div style="margin-bottom: 6px;"><strong>Distance:</strong> ~${distance.toFixed(1)} km</div>
                    <div style="margin-bottom: 6px;"><strong>Est. Time:</strong> ~${estimatedTime} min</div>
                    <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
                        📍 Click markers for details
                    </div>
                </div>
            `;
            return div;
        };
        routeInfo.addTo(map);

        // Fit map to show both markers with padding
        const group = new L.featureGroup([fromMarker, toMarker]);
        map.fitBounds(group.getBounds().pad(0.1));

        // Add click handler to show popups on load
        setTimeout(() => {
            fromMarker.openPopup();
            setTimeout(() => {
                fromMarker.closePopup();
            }, 2000);
        }, 500);
    }

    // Calculate distance using Haversine formula
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
}

// Global function for tracking
function trackOrder() {
    if (window.trackingManager) {
        window.trackingManager.trackOrder();
    }
}

// Initialize tracking manager
document.addEventListener('DOMContentLoaded', function() {
    window.trackingManager = new TrackingManager();
});
