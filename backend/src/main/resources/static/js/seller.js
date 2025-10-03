class SellerDashboard {
    constructor() {
        this.orders = [];
        this.couriers = [];
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
            await this.loadCouriers();
            await this.loadOrders();
            await this.loadStats();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization failed:', error);
            Utils.showNotification('Failed to load dashboard. Please refresh the page.', 'error');
        }
    }

    setupEventListeners() {
        // Create order form
        const createOrderForm = document.getElementById('createOrderForm');
        if (createOrderForm) {
            createOrderForm.addEventListener('submit', this.handleCreateOrder.bind(this));
        }

        // Auto-calculate shipping cost when weight changes
        const weightInput = document.querySelector('input[name="weight"]');
        if (weightInput) {
            weightInput.addEventListener('input', this.calculateShippingPreview.bind(this));
        }
    }

    async loadUserInfo() {
        const userInfo = Utils.getUserInfo();
        if (userInfo) {
            document.getElementById('userName').textContent = userInfo.email;
            document.getElementById('userAvatar').textContent = userInfo.email.charAt(0).toUpperCase();
        }
    }

    async loadCouriers() {
        try {
            this.couriers = await Utils.makeAPICall('/couriers');
            this.populateCourierSelect();
        } catch (error) {
            console.error('Failed to load couriers:', error);
            Utils.showNotification('Failed to load courier services.', 'error');
        }
    }

    populateCourierSelect() {
        const select = document.getElementById('courierSelect');
        if (select) {
            select.innerHTML = '<option value="">Select Courier Service</option>';
            this.couriers.forEach(courier => {
                const option = document.createElement('option');
                option.value = courier.name;
                option.textContent = `${courier.name} (${courier.serviceType}) - $${courier.pricing.baseRate} base`;
                select.appendChild(option);
            });
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
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No orders found</td></tr>';
            return;
        }

        tbody.innerHTML = this.orders.map(order => `
            <tr>
                <td><strong>${order.orderNumber}</strong></td>
                <td>${order.product.name}</td>
                <td>${order.buyerEmail || 'N/A'}</td>
                <td>${order.shipping.courierService}</td>
                <td><span class="status-badge status-${order.status.toLowerCase().replace('_', '-')}">${order.status.replace('_', ' ')}</span></td>
                <td>${Utils.formatCurrency(order.pricing.total)}</td>
                <td>${Utils.formatDate(order.createdAt)}</td>
                <td>
                    <button onclick="sellerDashboard.viewOrderDetails('${order.id}')" class="btn btn-secondary" style="margin-right: 0.5rem;">View</button>
                    ${order.status === 'PENDING' ? `<button onclick="sellerDashboard.cancelOrder('${order.id}')" class="btn" style="background: var(--error-color); color: white;">Cancel</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    async loadStats() {
        if (this.orders.length === 0) return;

        const totalOrders = this.orders.length;
        const activeOrders = this.orders.filter(order => 
            ['PENDING', 'CONFIRMED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status)
        ).length;
        const deliveredOrders = this.orders.filter(order => order.status === 'DELIVERED').length;
        const totalRevenue = this.orders
            .filter(order => order.status === 'DELIVERED')
            .reduce((sum, order) => sum + order.pricing.total, 0);

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('activeOrders').textContent = activeOrders;
        document.getElementById('deliveredOrders').textContent = deliveredOrders;
        document.getElementById('totalRevenue').textContent = Utils.formatCurrency(totalRevenue);
    }

    async handleCreateOrder(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        Utils.showLoading(submitBtn);

        try {
            const formData = new FormData(event.target);
            
            const orderData = {
                productName: formData.get('productName'),
                productCategory: formData.get('productCategory'),
                weight: parseFloat(formData.get('weight')),
                productValue: parseFloat(formData.get('productValue')),
                buyerEmail: formData.get('buyerEmail'),
                courierService: formData.get('courierService'),
                fromAddress: {
                    street: formData.get('fromStreet'),
                    city: formData.get('fromCity'),
                    state: formData.get('fromState'),
                    postalCode: formData.get('fromPostalCode'),
                    country: 'USA'
                },
                toAddress: {
                    street: formData.get('toStreet'),
                    city: formData.get('toCity'),
                    state: formData.get('toState'),
                    postalCode: formData.get('toPostalCode'),
                    country: 'USA'
                }
            };

            const newOrder = await Utils.makeAPICall('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            Utils.showNotification('Order created successfully!', 'success');
            this.closeCreateOrderModal();
            await this.loadOrders();
            await this.loadStats();
            
            // Reset form
            event.target.reset();

        } catch (error) {
            Utils.showNotification(error.message || 'Failed to create order.', 'error');
        } finally {
            Utils.hideLoading(submitBtn);
        }
    }

    calculateShippingPreview() {
        const weightInput = document.querySelector('input[name="weight"]');
        const courierSelect = document.getElementById('courierSelect');
        
        if (weightInput && courierSelect && weightInput.value && courierSelect.value) {
            const weight = parseFloat(weightInput.value);
            const selectedCourier = this.couriers.find(c => c.name === courierSelect.value);
            
            if (selectedCourier) {
                const shippingCost = selectedCourier.pricing.baseRate + (weight * selectedCourier.pricing.perKgRate);
                
                // Show preview (you can add a preview element in the HTML)
                console.log(`Estimated shipping cost: $${shippingCost.toFixed(2)}`);
            }
        }
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
        // Implementation for showing order details modal
        Utils.showNotification('Order details feature coming soon!', 'info');
    }

    async cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            await Utils.makeAPICall(`/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: 'CANCELLED',
                    location: 'Seller Location',
                    description: 'Order cancelled by seller'
                })
            });

            Utils.showNotification('Order cancelled successfully.', 'success');
            await this.loadOrders();
            await this.loadStats();
        } catch (error) {
            Utils.showNotification('Failed to cancel order.', 'error');
        }
    }

    // Modal functions
    openCreateOrderModal() {
        document.getElementById('createOrderModal').style.display = 'flex';
    }

    closeCreateOrderModal() {
        document.getElementById('createOrderModal').style.display = 'none';
    }

    // Utility functions
    showCourierServices() {
        Utils.showNotification('Courier services feature coming soon!', 'info');
    }

    exportOrders() {
        Utils.showNotification('Export feature coming soon!', 'info');
    }
}

// Global functions
function openCreateOrderModal() {
    sellerDashboard.openCreateOrderModal();
}

function closeCreateOrderModal() {
    sellerDashboard.closeCreateOrderModal();
}

function loadOrders() {
    sellerDashboard.loadOrders();
}

function showCourierServices() {
    sellerDashboard.showCourierServices();
}

function exportOrders() {
    sellerDashboard.exportOrders();
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
    window.sellerDashboard = new SellerDashboard();
});
