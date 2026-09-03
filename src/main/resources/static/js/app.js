// ============================================================
// SELMS — Smart Enterprise Logistics Management System
// app.js — Core application: navigation, utilities, page init
// ============================================================

window.SELMS = window.SELMS || {};

// ── SVG icon helper ──────────────────────────────────────────
SELMS.icons = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

// ── Toast Notifications ──────────────────────────────────────
SELMS.toast = (function () {
  function show(type, title, message, duration = 4000) {
    const iconMap = {
      success: SELMS.icons.check,
      error:   SELMS.icons.alertCircle,
      warning: SELMS.icons.alertCircle,
      info:    SELMS.icons.info,
    };

    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <span class="toast-close" onclick="this.closest('.toast').remove()">${SELMS.icons.x}</span>
    `;
    container.appendChild(el);
    if (duration > 0) setTimeout(() => el.remove(), duration);
  }

  return {
    success: (title, msg) => show('success', title, msg),
    error:   (title, msg) => show('error',   title, msg),
    warning: (title, msg) => show('warning', title, msg),
    info:    (title, msg) => show('info',    title, msg),
  };
})();

// ── Navigation ───────────────────────────────────────────────
SELMS.nav = (function () {
  const pages = ['dashboard', 'place-order', 'inventory', 'tracking', 'routes'];

  const pageMeta = {
    'dashboard':   { label: 'Dashboard',            breadcrumb: 'Dashboard' },
    'place-order': { label: 'Place Order',           breadcrumb: 'Orders / Place Order' },
    'inventory':   { label: 'Inventory Management', breadcrumb: 'Inventory' },
    'tracking':    { label: 'Delivery Tracking',    breadcrumb: 'Deliveries / Tracking' },
    'routes':      { label: 'Route Optimization',   breadcrumb: 'Logistics / Route Optimization' },
  };

  function navigate(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => {
      p.classList.remove('active');
    });

    // Remove active from nav items
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Activate page
    const page = document.getElementById(`page-${pageId}`);
    if (page) {
      page.classList.add('active');
      // Trigger page-specific init
      if (SELMS.pages && SELMS.pages[pageId]) {
        SELMS.pages[pageId].init();
      }
    }

    // Activate nav item
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');

    // Update breadcrumb
    const meta = pageMeta[pageId];
    if (meta) {
      const parts = meta.breadcrumb.split(' / ');
      const bc = document.getElementById('breadcrumb');
      if (bc) {
        if (parts.length === 1) {
          bc.innerHTML = `<span class="breadcrumb-current">${parts[0]}</span>`;
        } else {
          bc.innerHTML = parts.map((p, i) =>
            i < parts.length - 1
              ? `<span class="breadcrumb-root">${p}</span><span class="breadcrumb-sep">›</span>`
              : `<span class="breadcrumb-current">${p}</span>`
          ).join('');
        }
      }
    }

    // Update hash
    window.location.hash = pageId;
  }

  function init() {
    // Wire up nav items
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.page));
    });

    // Check URL hash
    const hash = window.location.hash.replace('#', '');
    const startPage = pages.includes(hash) ? hash : 'dashboard';
    navigate(startPage);
  }

  return { init, navigate };
})();

function addProduct() {
    const productName = document.getElementById("newProductName").value;

    SELMS.data.products.push(productName);

    const dropdown = document.getElementById("order-product");
    const option = document.createElement("option");
    option.value = productName;
    option.text = productName;
    dropdown.add(option);
}

function openCustomerModal() {
    document.getElementById("customer-modal").style.display = "block";
}

function closeCustomerModal() {
    document.getElementById("customer-modal").style.display = "none";
}

function addCustomer() {
    const name = document.getElementById("newCustomerName").value.trim();
    const city = document.getElementById("newCustomerCity").value.trim();

    if (!name || !city) {
        SELMS.toast.error("Missing Fields", "Please fill all customer details");
        return;
    }

    const customer = {
        id: Date.now(),
        name: name,
        city: city
    };

    SELMS.data.customers.push(customer);

    const dropdown = document.getElementById("order-customer");
    const option = document.createElement("option");
    option.value = customer.id;
    option.text = `${name} (${city})`;
    dropdown.add(option);

    document.getElementById("newCustomerName").value = "";
    document.getElementById("newCustomerCity").value = "";
    closeCustomerModal();

    SELMS.toast.success("Customer Added", `${name} added successfully`);
}

function openProductModal() {
    document.getElementById("product-modal").style.display = "block";
}

function closeProductModal() {
    document.getElementById("product-modal").style.display = "none";
}

function addProduct() {
    const productName = document.getElementById("newProductName").value.trim();

    if (!productName) {
        SELMS.toast.error("Missing Product", "Enter a product name");
        return;
    }

    SELMS.data.products.push(productName);

    const dropdown = document.getElementById("order-product");
    const option = document.createElement("option");
    option.value = productName;
    option.text = productName;
    dropdown.add(option);

    document.getElementById("newProductName").value = "";
    closeProductModal();

    SELMS.toast.success("Product Added", `${productName} added successfully`);
}
// ── Utilities ────────────────────────────────────────────────
SELMS.utils = {
  formatCost(n) { return n === 0 ? '—' : `₹${n.toLocaleString()}`; },

  priorityBadge(p) {
    const map = {
      'PREMIUM': 'badge-premium',
      'URGENT':  'badge-urgent',
      'NORMAL':  'badge-normal',
    };
    return `<span class="badge ${map[p] || 'badge-normal'}">
      <span class="badge-dot"></span>${p}
    </span>`;
  },

  statusBadge(s) {
    const map = {
      'DISPATCHED':  ['badge-dispatched',  'Dispatched'],
      'DELIVERED':   ['badge-delivered',   'Delivered'],
      'PENDING':     ['badge-pending',     'Pending'],
      'FAILED':      ['badge-failed',      'Failed'],
      'IN_TRANSIT':  ['badge-dispatched',  'In Transit'],
      'PROCESSING':  ['badge-pending',     'Processing'],
    };
    const [cls, label] = map[s] || ['badge-normal', s];
    return `<span class="badge ${cls}"><span class="badge-dot"></span>${label}</span>`;
  },

  escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  },

  stockLevel(qty, max) {
    const pct = Math.round((qty / max) * 100);
    if (pct <= 20) return { cls: 'low',    pct };
    if (pct <= 50) return { cls: 'medium', pct };
    return               { cls: 'high',   pct };
  },

  animateCounter(el, target, duration = 800) {
    const start = performance.now();
    const from  = parseInt(el.textContent.replace(/\D/g, '')) || 0;
    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (target - from) * ease).toLocaleString();
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  },
};

// ── Table Sort Helper ────────────────────────────────────────
SELMS.tableSort = function (tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  let sortCol = -1, sortAsc = true;

  table.querySelectorAll('th[data-sort]').forEach((th, i) => {
    th.addEventListener('click', () => {
      if (sortCol === i) sortAsc = !sortAsc;
      else { sortCol = i; sortAsc = true; }

      table.querySelectorAll('th .sort-icon').forEach(s => s.textContent = '↕');
      th.querySelector('.sort-icon').textContent = sortAsc ? '↑' : '↓';

      const tbody = table.querySelector('tbody');
      const rows  = Array.from(tbody.querySelectorAll('tr'));

      rows.sort((a, b) => {
        const av = a.cells[i]?.textContent.trim() || '';
        const bv = b.cells[i]?.textContent.trim() || '';
        const n  = parseFloat(av) - parseFloat(bv);
        const cmp = isNaN(n) ? av.localeCompare(bv) : n;
        return sortAsc ? cmp : -cmp;
      });

      rows.forEach(r => tbody.appendChild(r));
    });
  });
};

// ── Search / Filter Helper ───────────────────────────────────
SELMS.tableFilter = function (inputId, tableId) {
  const input = document.getElementById(inputId);
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!input || !tbody) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    tbody.querySelectorAll('tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
};

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  SELMS.nav.init();
  SELMS.pages.dashboard.init();
});
