class BuyerDashboard {
    constructor() {
        this.orders = [];
        this.init();
    }

    async init() {
        try {
            // Check authentication
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
        // Flag order form
        const flagOrderForm = document.getElementById('flagOrderForm');
        if (flagOrderForm) {
            flagOrderForm.addEventListener('submit', this.handleFlagOrder.bind(this));
        }

        // Quick tracking
        const quickTrackingInput = document.getElementById('quickTrackingInput');
        if (quickTrackingInput) {
            quickTrackingInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.quickTrack();
                }
            });
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
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders found</td></tr>';
            return;
        }

        tbody.innerHTML = this.orders.map(order => `
            <tr>
                <td><strong>${order.orderNumber}</strong></td>
                <td>${order.product.name}</td>
                <td><code>${order.shipping.trackingNumber}</code></td>
                <td><span class="status-badge status-${order.status.toLowerCase().replace('_', '-')}">${order.status.replace('_', ' ')}</span></td>
                <td>${Utils.formatCurrency(order.pricing.total)}</td>
                <td>${Utils.formatDate(order.shipping.estimatedDelivery)}</td>
                <td>
                    <button onclick="buyerDashboard.viewOrderDetails('${order.id}')" class="btn btn-secondary" style="margin-right: 0.5rem;">Details</button>
                    <button onclick="buyerDashboard.trackOrder('${order.shipping.trackingNumber}')" class="btn btn-primary" style="margin-right: 0.5rem;">Track</button>
                    ${this.canFlagOrder(order.status) ? `<button onclick="buyerDashboard.openFlagOrderModal('${order.id}')" class="btn" style="background: var(--warning-color); color: white;">Flag</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    canFlagOrder(status) {
        return ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(status);
    }

    async loadStats() {
        if (this.orders.length === 0) return;

        const totalOrders = this.orders.length;
        const inTransitOrders = this.orders.filter(order => 
            ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status)
        ).length;
        const deliveredOrders = this.orders.filter(order => order.status === 'DELIVERED').length;
        const flaggedOrders = this.orders.filter(order => order.status === 'FLAGGED').length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('inTransitOrders').textContent = inTransitOrders;
        document.getElementById('deliveredOrders').textContent = deliveredOrders;
        document.getElementById('flaggedOrders').textContent = flaggedOrders;
    }

    async quickTrack() {
        const trackingInput = document.getElementById('quickTrackingInput');
        const trackingNumber = trackingInput?.value?.trim();
        
        if (!trackingNumber) {
            Utils.showNotification('Please enter a tracking number.', 'warning');
            return;
        }

        try {
            const response = await Utils.makeAPICall(`/tracking/public/${trackingNumber}`);
            this.displayQuickTrackingResult(response);
        } catch (error) {
            this.clearQuickTrackingResult();
            Utils.showNotification('Order not found. Please check your tracking number.', 'error');
        }
    }

    displayQuickTrackingResult(order) {
        const resultContainer = document.getElementById('quickTrackingResult');
        if (!resultContainer) return;

        const statusClass = order.status.toLowerCase().replace('_', '-');
        
        resultContainer.innerHTML = `
            <div style="margin-top: 1rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--background-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${order.orderNumber}</strong>
                    <span class="status-badge status-${statusClass}">${order.status.replace('_', ' ')}</span>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    <div><strong>Product:</strong> ${order.product.name}</div>
                    <div><strong>Courier:</strong> ${order.shipping.courierService}</div>
                    <div><strong>Est. Delivery:</strong> ${Utils.formatDate(order.shipping.estimatedDelivery)}</div>
                </div>
                <button onclick="buyerDashboard.viewOrderDetails('${order.id}')" class="btn btn-primary" style="margin-top: 1rem;">View Full Details</button>
            </div>
        `;
    }

    clearQuickTrackingResult() {
        const resultContainer = document.getElementById('quickTrackingResult');
        if (resultContainer) {
            resultContainer.innerHTML = '';
        }
    }

    async trackOrder(trackingNumber) {
        try {
            const response = await Utils.makeAPICall(`/tracking/public/${trackingNumber}`);
            this.showTrackingModal(response);
        } catch (error) {
            Utils.showNotification('Failed to load tracking information.', 'error');
        }
    }

    showTrackingModal(order) {
        // Create a modal to show detailed tracking information
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">Order Tracking - ${order.orderNumber}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="tracking-details" style="padding: 1.5rem;">
                    ${this.generateTrackingHTML(order)}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    generateTrackingHTML(order) {
        const statusClass = order.status.toLowerCase().replace('_', '-');
        
        return `
            <div class="tracking-header" style="margin-bottom: 2rem;">
                <h4>${order.product.name}</h4>
                <span class="status-badge status-${statusClass}">${order.status.replace('_', ' ')}</span>
            </div>
            
            <div class="tracking-info" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div>
                    <strong>Tracking Number:</strong><br>
                    <code>${order.trackingNumber}</code>
                </div>
                <div>
                    <strong>Courier Service:</strong><br>
                    ${order.shipping.courierService}
                </div>
                <div>
                    <strong>Total Value:</strong><br>
                    ${Utils.formatCurrency(order.pricing.total)}
                </div>
                <div>
                    <strong>Est. Delivery:</strong><br>
                    ${Utils.formatDate(order.shipping.estimatedDelivery)}
                </div>
            </div>
            
            <div class="tracking-timeline">
                <h4>Tracking Timeline</h4>
                <div class="timeline" style="position: relative; padding-left: 2rem;">
                    ${order.timeline.map((event, index) => `
                        <div class="timeline-item" style="position: relative; margin-bottom: 1.5rem; ${index === 0 ? 'font-weight: 600;' : ''}">
                            <div class="timeline-marker" style="position: absolute; left: -2rem; top: 0.25rem; width: 12px; height: 12px; border-radius: 50%; background: ${index === 0 ? 'var(--primary-color)' : 'var(--border-color)'};"></div>
                            <div class="timeline-time" style="color: var(--text-secondary); font-size: 0.875rem;">${Utils.formatDate(event.timestamp)}</div>
                            <div class="timeline-status">${event.status.replace('_', ' ')}</div>
                            <div class="timeline-description" style="color: var(--text-secondary);">${event.description}</div>
                            ${event.location ? `<div class="timeline-location" style="color: var(--text-secondary); font-size: 0.875rem;">📍 ${event.location}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async viewOrderDetails(orderId) {
        try {
            const order = await Utils.makeAPICall(`/orders/${orderId}`);
            this.showOrderDetailsModal(order);
        } catch (error) {
            Utils.showNotification('Failed to load order details.', 'error');
        }
    }

    showOrderDetailsModal(order) {
        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('orderDetailsContent');
        
        if (modal && content) {
            content.innerHTML = this.generateOrderDetailsHTML(order);
            modal.style.display = 'flex';
        }
    }

    generateOrderDetailsHTML(order) {
        return `
            <div style="padding: 1rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                    <div>
                        <h4>Order Information</h4>
                        <div><strong>Order Number:</strong> ${order.orderNumber}</div>
                        <div><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase().replace('_', '-')}">${order.status.replace('_', ' ')}</span></div>
                        <div><strong>Created:</strong> ${Utils.formatDate(order.createdAt)}</div>
                        <div><strong>Updated:</strong> ${Utils.formatDate(order.updatedAt)}</div>
                    </div>
                    
                    <div>
                        <h4>Product Details</h4>
                        <div><strong>Name:</strong> ${order.product.name}</div>
                        <div><strong>Category:</strong> ${order.product.category}</div>
                        <div><strong>Weight:</strong> ${order.product.weight} kg</div>
                        <div><strong>Value:</strong> ${Utils.formatCurrency(order.product.value)}</div>
                    </div>
                    
                    <div>
                        <h4>Shipping Details</h4>
                        <div><strong>Courier:</strong> ${order.shipping.courierService}</div>
                        <div><strong>Tracking:</strong> <code>${order.shipping.trackingNumber}</code></div>
                        <div><strong>Est. Delivery:</strong> ${Utils.formatDate(order.shipping.estimatedDelivery)}</div>
                        <div><strong>Total Cost:</strong> ${Utils.formatCurrency(order.pricing.total)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    openFlagOrderModal(orderId) {
        document.getElementById('flagOrderId').value = orderId;
        document.getElementById('flagOrderModal').style.display = 'flex';
    }

    closeFlagOrderModal() {
        document.getElementById('flagOrderModal').style.display = 'none';
        document.getElementById('flagOrderForm').reset();
    }

    closeOrderDetailsModal() {
        document.getElementById('orderDetailsModal').style.display = 'none';
    }

    async handleFlagOrder(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        Utils.showLoading(submitBtn);

        try {
            const orderId = document.getElementById('flagOrderId').value;
            const formData = new FormData(event.target);
            const reason = formData.get('reason');

            await Utils.makeAPICall(`/orders/${orderId}/flag?reason=${encodeURIComponent(reason)}`, {
                method: 'POST'
            });

            Utils.showNotification('Issue reported successfully. We will investigate and contact you soon.', 'success');
            this.closeFlagOrderModal();
            await this.loadOrders();
            await this.loadStats();

        } catch (error) {
            Utils.showNotification('Failed to report issue. Please try again.', 'error');
        } finally {
            Utils.hideLoading(submitBtn);
        }
    }
}

// Global functions
function quickTrack() {
    buyerDashboard.quickTrack();
}

function loadOrders() {
    buyerDashboard.loadOrders();
}

function closeFlagOrderModal() {
    buyerDashboard.closeFlagOrderModal();
}

function closeOrderDetailsModal() {
    buyerDashboard.closeOrderDetailsModal();
}

function logout() {
    if (window.authManager) {
        window.authManager.logout();
    } else {
        Utils.removeAuthToken();
        window.location.href = '../login.html';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    window.buyerDashboard = new BuyerDashboard();
});
