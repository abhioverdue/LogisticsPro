class CourierDashboard {
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
        // Update status form
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
        // Simple priority logic based on delivery time
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
        
        // Calculate delivered today
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

        // Find order by ID or tracking number
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

    viewRoute(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            Utils.showNotification('Order not found.', 'error');
            return;
        }

        // Show route information
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Route Details - ${order.orderNumber}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="margin-bottom: 1rem;">
                        <h4>Pickup Location</h4>
                        <p>${order.shipping.from.street}<br>
                        ${order.shipping.from.city}, ${order.shipping.from.state} ${order.shipping.from.postalCode}</p>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <h4>Delivery Location</h4>
                        <p>${order.shipping.to.street}<br>
                        ${order.shipping.to.city}, ${order.shipping.to.state} ${order.shipping.to.postalCode}</p>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <h4>Product Details</h4>
                        <p><strong>Product:</strong> ${order.product.name}<br>
                        <strong>Weight:</strong> ${order.product.weight} kg<br>
                        <strong>Value:</strong> ${Utils.formatCurrency(order.product.value)}</p>
                    </div>
                    
                    <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                        <p>Google Maps integration would show the route here</p>
                    </div>
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

    viewRoute() {
        Utils.showNotification('Route optimization feature coming soon!', 'info');
    }

    optimizeRoute() {
        Utils.showNotification('Route optimization feature coming soon!', 'info');
    }
}

// Global functions
function quickUpdateStatus() {
    courierDashboard.quickUpdateStatus();
}

function loadOrders() {
    courierDashboard.loadOrders();
}

function closeUpdateStatusModal() {
    courierDashboard.closeUpdateStatusModal();
}

function viewRoute() {
    courierDashboard.viewRoute();
}

function optimizeRoute() {
    courierDashboard.optimizeRoute();
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
    window.courierDashboard = new CourierDashboard();
});
