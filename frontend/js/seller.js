// ../js/seller.js
class SellerDashboard {
  constructor() {
    this.orders = [];
    this.couriers = [];
    this.init();
  }

  async init() {
    try {
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
    const createOrderForm = document.getElementById('createOrderForm');
    if (createOrderForm) {
      createOrderForm.addEventListener('submit', this.handleCreateOrder.bind(this));
    }
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
  // Build modal if not present
  let modal = document.getElementById('orderDetailsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'orderDetailsModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="width:min(1000px,95vw);max-height:90vh;overflow:auto;">
        <div class="modal-header">
          <h3 class="modal-title">Order Details</h3>
          <button class="close-btn" onclick="document.getElementById('orderDetailsModal').style.display='none'">&times;</button>
        </div>
        <div class="modal-body" id="orderDetailsBody" style="padding:1.25rem;"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }

  // Render content
  const b = document.getElementById('orderDetailsBody');
  const addr = (a) => `
    <div>
      <div>${a?.street || '-'}</div>
      <div>${a?.city || '-'}, ${a?.state || '-'} ${a?.postalCode || '-'}</div>
      <div>${a?.country || '-'}</div>
    </div>
  `;
  b.innerHTML = `
    <div style="display:grid;grid-template-columns: repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-bottom:1rem;">
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
        <div style="font-weight:700;margin-bottom:6px;">Summary</div>
        <div><strong>Order #:</strong> ${order.orderNumber}</div>
        <div><strong>Status:</strong> <span class="status-badge status-${(order.status||'').toLowerCase().replace('_','-')}">${(order.status||'').replace('_',' ')}</span></div>
        <div><strong>Courier:</strong> ${order.shipping?.courierService || '-'}</div>
        <div><strong>Created:</strong> ${Utils.formatDate(order.createdAt) || '-'}</div>
        <div><strong>Updated:</strong> ${Utils.formatDate(order.updatedAt) || '-'}</div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
        <div style="font-weight:700;margin-bottom:6px;">Product</div>
        <div><strong>Name:</strong> ${order.product?.name || '-'}</div>
        <div><strong>Category:</strong> ${order.product?.category || '-'}</div>
        <div><strong>Weight:</strong> ${order.product?.weight ?? '-'} kg</div>
        <div><strong>Value:</strong> ${order.product?.value != null ? Utils.formatCurrency(order.product.value) : '-'}</div>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
        <div style="font-weight:700;margin-bottom:6px;">Pricing</div>
        <div><strong>Total:</strong> ${order.pricing?.total != null ? Utils.formatCurrency(order.pricing.total) : '-'}</div>
        <div><strong>Base:</strong> ${order.pricing?.base != null ? Utils.formatCurrency(order.pricing.base) : '-'}</div>
        <div><strong>Shipping:</strong> ${order.pricing?.shipping != null ? Utils.formatCurrency(order.pricing.shipping) : '-'}</div>
        <div><strong>Tax:</strong> ${order.pricing?.tax != null ? Utils.formatCurrency(order.pricing.tax) : '-'}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns: repeat(auto-fit,minmax(300px,1fr));gap:1rem;margin-bottom:1rem;">
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
        <div style="font-weight:700;margin-bottom:6px;">From (Pickup)</div>
        ${addr(order.shipping?.from)}
      </div>
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
        <div style="font-weight:700;margin-bottom:6px;">To (Delivery)</div>
        ${addr(order.shipping?.to)}
      </div>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:1rem;">
      <div style="font-weight:700;margin-bottom:8px;">Timeline</div>
      ${(order.timeline && order.timeline.length ? order.timeline : []).map(ev => `
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:8px;">
          <div style="width:8px;height:8px;border-radius:50%;background:#2563eb;margin-top:6px;"></div>
          <div>
            <div style="font-weight:600;">${(ev.status||'').replace('_',' ')}</div>
            <div style="color:#6b7280;font-size:0.9rem;">${Utils.formatDate(ev.timestamp) || '-'}</div>
            ${ev.description ? `<div style="margin-top:2px;">${ev.description}</div>` : ''}
            ${ev.location ? `<div style="color:#6b7280;font-size:0.9rem;">📍 ${ev.location}</div>` : ''}
          </div>
        </div>
      `).join('') || '<div style="color:#6b7280;">No timeline events.</div>'}
    </div>

    <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
      ${order.status === 'PENDING' ? `<button class="btn" style="background:var(--error-color);color:#fff;" onclick="sellerDashboard.cancelOrder('${order.id}')">Cancel Order</button>` : ''}
      <button class="btn btn-secondary" onclick="document.getElementById('orderDetailsModal').style.display='none'">Close</button>
    </div>
  `;

  modal.style.display = 'flex';
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

  openCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'flex';
  }

  closeCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'none';
  }

  showCourierServices() {
    let modal = document.getElementById('couriersModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'couriersModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Available Courier Services</h3>
            <button class="close-btn" onclick="document.getElementById('couriersModal').style.display='none'">&times;</button>
          </div>
          <div class="modal-body">
            <div id="couriersList"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    const list = modal.querySelector('#couriersList');
    list.innerHTML = this.couriers.length
      ? this.couriers.map(c => `
          <div class="courier-card">
            <div>
              <div style="font-weight:600;">${c.name} (${c.serviceType})</div>
              <div style="color:#6b7280;font-size:0.9rem;">ETD: ${c.pricing?.etaHours ?? '-'}h • Base: $${c.pricing?.baseRate ?? 0} • per Kg: $${c.pricing?.perKgRate ?? 0}</div>
            </div>
          </div>
        `).join('')
      : '<div style="color:#6b7280;">No courier services found.</div>';

    modal.style.display = 'flex';
  }

exportOrders() {
  if (!this.orders.length) {
    Utils.showNotification('No orders to export.', 'warning');
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    Utils.showNotification('jsPDF not loaded. Include jsPDF before seller.js.', 'error');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  if (typeof doc.autoTable !== 'function') {
    Utils.showNotification('AutoTable not loaded. Include AutoTable before seller.js.', 'error');
    return;
  }

  const rows = this.orders.map(o => ([
    o.orderNumber,
    o.product?.name || '',
    o.buyerEmail || '',
    o.shipping?.courierService || '',
    (o.status || '').replace('_',' '),
    (o.pricing?.total != null ? Utils.formatCurrency(o.pricing.total) : ''),
    Utils.formatDate(o.createdAt) || ''
  ]));

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Orders Report', 40, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

  doc.autoTable({
    startY: 80,
    head: [[ 'Order #','Product','Buyer','Courier','Status','Total','Created' ]],
    body: rows,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 160 },
      2: { cellWidth: 130 },
      3: { cellWidth: 120 },
      4: { cellWidth: 110 },
      5: { cellWidth: 90, halign: 'right' },
      6: { cellWidth: 120 }
    },
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.getWidth();
      const pageHeight = pageSize.getHeight();
      doc.setFontSize(9);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 80, pageHeight - 20);
    }
  });

  doc.save(`orders_${new Date().toISOString().slice(0,10)}.pdf`);
  Utils.showNotification('Exported orders to PDF.', 'success');
}
}

function openCreateOrderModal(){ sellerDashboard.openCreateOrderModal(); }
function closeCreateOrderModal(){ sellerDashboard.closeCreateOrderModal(); }
function loadOrders(){
  sellerDashboard.loadOrders().then(() => sellerDashboard.loadStats && sellerDashboard.loadStats());
}
function showCourierServices(){ sellerDashboard.showCourierServices(); }
function exportOrders(){ sellerDashboard.exportOrders(); }
function logout(){
  if (window.authManager) window.authManager.logout();
  else { Utils.removeAuthToken(); window.location.href = '../login.html'; }
}

document.addEventListener('DOMContentLoaded', () => { window.sellerDashboard = new SellerDashboard(); });

