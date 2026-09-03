// ============================================================
// SELMS — pages.js
// Each page: { init() } — renders dynamic content
// ============================================================

window.SELMS = window.SELMS || {};
SELMS.pages = {};

// ══════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════
SELMS.pages['dashboard'] = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    const d  = SELMS.data;
    const u  = SELMS.utils;

    // ── Stat counters ──
    const counterMap = {
      'stat-total':     d.stats.totalOrders,
      'stat-pending':   d.stats.pendingOrders,
      'stat-delivered': d.stats.deliveredOrders,
      'stat-failed':    d.stats.failedOrders,
    };
    Object.entries(counterMap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) u.animateCounter(el, val);
    });

    // ── Recent orders table ──
    const tbody = document.getElementById('recent-orders-body');
    if (tbody) {
      tbody.innerHTML = d.orders.slice(0, 6).map(o => `
        <tr>
          <td><span class="table-order-id">#${o.orderId}</span></td>
          <td>${u.escapeHtml(o.customerName)}</td>
          <td>${u.escapeHtml(o.product)}</td>
          <td class="table-cell-muted">${o.qty}</td>
          <td>${u.priorityBadge(o.priority)}</td>
          <td>${u.statusBadge(o.status)}</td>
          <td class="table-cell-muted">${u.formatCost(o.deliveryCost)}</td>
          <td class="table-cell-muted">${o.date}</td>
        </tr>
      `).join('');

      SELMS.tableSort('recent-orders-table');
    }

    // ── Bar chart ──
    const chartArea = document.getElementById('cost-chart');
    if (chartArea) {
      const cd = d.chartData;
      const max = Math.max(...cd.orderCosts);

      chartArea.innerHTML = cd.labels.map((label, i) => {
        const h = Math.round((cd.orderCosts[i] / max) * 140);
        return `
          <div class="chart-bar-group">
            <div class="chart-bar" style="height:${h}px; opacity:0; transition: height 0.7s ${i * 0.08}s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ${i * 0.08}s">
              <div class="bar-tooltip">₹${cd.orderCosts[i]}</div>
            </div>
            <div class="chart-label">${label}</div>
          </div>
        `;
      }).join('');

      setTimeout(() => {
        chartArea.querySelectorAll('.chart-bar').forEach(b => {
          b.style.opacity = '1';
        });
      }, 100);
    }

    // ── Warehouse perf ──
    const whPerf = document.getElementById('warehouse-perf-body');
    if (whPerf) {
      whPerf.innerHTML = d.warehouses.map(w => {
        const totalItems = w.inventory.reduce((s, i) => s + i.qty, 0);
        const totalMax   = w.inventory.reduce((s, i) => s + i.maxQty, 0);
        const pct = Math.round((totalItems / totalMax) * 100);
        const level = u.stockLevel(totalItems, totalMax);
        return `
          <tr>
            <td>
              <span style="font-weight:600;color:var(--navy-800)">${w.name}</span>
              <span class="table-cell-muted" style="display:block;font-size:0.75rem">${w.city}</span>
            </td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="stock-bar-wrap" style="width:100px">
                  <div class="stock-bar ${level.cls}" style="width:${pct}%"></div>
                </div>
                <span class="table-cell-muted">${pct}%</span>
              </div>
            </td>
            <td>${w.inventory.length}</td>
            <td>
              ${pct <= 20 ? '<span class="low-stock-flag">⚠ Low</span>' : '<span style="color:var(--emerald-500);font-size:0.78rem;font-weight:600">● Good</span>'}
            </td>
          </tr>
        `;
      }).join('');
    }
  }
};

// ══════════════════════════════════════════════════════════
// PAGE: PLACE ORDER
// ══════════════════════════════════════════════════════════
SELMS.pages['place-order'] = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Populate product dropdown
    const productSel = document.getElementById('order-product');
    if (productSel) {
      SELMS.data.products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p; opt.textContent = p;
        productSel.appendChild(opt);
      });
    }

    // Populate customer dropdown
    const custSel = document.getElementById('order-customer');
    if (custSel) {
      SELMS.data.customers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = `${c.name} (${c.city})`;
        custSel.appendChild(opt);
      });
    }

    // Order form submit
    const form = document.getElementById('order-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    }

    // Priority radio preview
    document.querySelectorAll('.priority-option input[type="radio"]').forEach(r => {
      r.addEventListener('change', () => this.updatePriorityPreview(r.value));
    });
  },

  updatePriorityPreview(val) {
    const preview = document.getElementById('priority-preview');
    if (!preview) return;
    const map = {
      'NORMAL':  { cls: 'badge-normal',  txt: 'Standard processing, best-effort routing.' },
      'URGENT':  { cls: 'badge-urgent',  txt: 'Expedited fulfillment, priority warehouse pick.' },
      'PREMIUM': { cls: 'badge-premium', txt: 'Highest priority, dedicated fast-route dispatch.' },
    };
    const m = map[val] || map['NORMAL'];
    preview.innerHTML = `
      <span class="badge ${m.cls}" style="margin-bottom:4px"><span class="badge-dot"></span>${val}</span>
      <p style="font-size:0.78rem;color:var(--slate-400);margin-top:4px">${m.txt}</p>
    `;
  },

  handleSubmit(form) {
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Processing…`;

    const custId  = document.getElementById('order-customer').value;
    const product = document.getElementById('order-product').value;
    const qty     = document.getElementById('order-qty').value;
    const priority = document.querySelector('input[name="priority"]:checked')?.value || 'NORMAL';

    // Simulate backend call
    setTimeout(() => {
      const newId = 109 + Math.floor(Math.random() * 900);

      // Add to data
      const cust = SELMS.data.customers.find(c => c.id == custId);
      SELMS.data.orders.unshift({
        orderId: newId,
        customerId: +custId,
        customerName: cust?.name || 'Unknown',
        product, qty: +qty, priority,
        status: 'PENDING',
        warehouseId: -1, warehouseName: '—',
        deliveryCost: 0,
        date: new Date().toISOString().split('T')[0],
      });
      SELMS.data.stats.totalOrders++;
      SELMS.data.stats.pendingOrders++;

      SELMS.toast.success('Order Placed', `Order #${newId} queued for processing.`);

      btn.disabled = false;
      btn.innerHTML = `${SELMS.icons?.check || '✓'} Place Order`;

      form.reset();
      document.getElementById('priority-preview').innerHTML = '';

      // Invalidate dashboard so it re-renders
      SELMS.pages['dashboard']._initialized = false;

      // Show confirm panel
      const conf = document.getElementById('order-confirm');
      if (conf) {
        conf.style.display = 'block';
        document.getElementById('conf-order-id').textContent  = `#${newId}`;
        document.getElementById('conf-product').textContent   = product;
        document.getElementById('conf-qty').textContent       = qty;
        document.getElementById('conf-priority').innerHTML    = SELMS.utils.priorityBadge(priority);
        document.getElementById('conf-customer').textContent  = cust?.name || '—';
      }
    }, 1200);
  }
};

// ══════════════════════════════════════════════════════════
// PAGE: INVENTORY
// ══════════════════════════════════════════════════════════
SELMS.pages['inventory'] = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    const container = document.getElementById('warehouse-cards');
    if (!container) return;

    container.innerHTML = SELMS.data.warehouses.map(w => {
      const inventoryRows = w.inventory.map(item => {
        const sl = SELMS.utils.stockLevel(item.qty, item.maxQty);
        return `
          <div class="inventory-row">
            <span class="inventory-product">${item.product}</span>
            <div style="display:flex;align-items:center;gap:10px">
              <div class="stock-bar-wrap">
                <div class="stock-bar ${sl.cls}" style="width:${sl.pct}%"></div>
              </div>
              <span class="inventory-qty">${item.qty}</span>
              ${sl.pct <= 20 ? '<span class="low-stock-flag">⚠ Low</span>' : ''}
            </div>
          </div>
        `;
      }).join('');

      const totalItems = w.inventory.reduce((s, i) => s + i.qty, 0);

      return `
        <div class="warehouse-card">
          <div class="warehouse-card-header">
            <div class="warehouse-info">
              <div class="warehouse-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div>
                <div class="warehouse-name">${w.name}</div>
                <div class="warehouse-city">${w.city}</div>
              </div>
            </div>
            <span class="warehouse-node-tag">Node ${w.cityNode}</span>
          </div>
          <div class="warehouse-card-body">
            ${inventoryRows}
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--slate-100)">
              <span style="font-size:0.75rem;color:var(--slate-400)">${w.inventory.length} SKUs</span>
              <span style="font-size:0.78rem;font-weight:600;color:var(--navy-700);font-family:'DM Mono',monospace">${totalItems} units</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // BST Range query demo
    this.renderBSTDemo();
  },

  renderBSTDemo() {
    const container = document.getElementById('bst-demo');
    if (!container) return;

    const w = SELMS.data.warehouses[1]; // Pune
    const items = [...w.inventory].sort((a, b) => a.product.localeCompare(b.product));

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${items.map((item, i) => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:var(--radius-md);background:var(--slate-50);border:1px solid var(--slate-100)">
            <span style="font-family:'DM Mono',monospace;font-size:0.72rem;color:var(--slate-400);width:20px;text-align:right">${i + 1}</span>
            <span style="font-size:0.85rem;font-weight:500;flex:1">${item.product}</span>
            <span style="font-family:'DM Mono',monospace;font-size:0.8rem;color:var(--navy-700)">${item.qty} units</span>
            <div class="stock-bar-wrap"><div class="stock-bar ${SELMS.utils.stockLevel(item.qty, item.maxQty).cls}" style="width:${SELMS.utils.stockLevel(item.qty, item.maxQty).pct}%"></div></div>
          </div>
        `).join('')}
        <p style="font-size:0.72rem;color:var(--slate-400);margin-top:4px;padding-left:4px">
          TreeMap (Red-Black BST) — O(log n) insert/lookup · Alphabetical key order
        </p>
      </div>
    `;
  }
};

// ══════════════════════════════════════════════════════════
// PAGE: DELIVERY TRACKING
// ══════════════════════════════════════════════════════════
SELMS.pages['tracking'] = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    const tbody = document.getElementById('tracking-body');
    if (!tbody) return;

    this.render(SELMS.data.deliveryRecords);
    SELMS.tableSort('tracking-table');
    SELMS.tableFilter('tracking-search', 'tracking-table');

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('btn-primary'));
        document.querySelectorAll('[data-filter]').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-outline');
        });
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');

        const f = btn.dataset.filter;
        const filtered = f === 'ALL'
          ? SELMS.data.deliveryRecords
          : SELMS.data.deliveryRecords.filter(r => r.status === f || r.priority === f);
        this.render(filtered);
      });
    });
  },

  render(records) {
    const tbody = document.getElementById('tracking-body');
    if (!tbody) return;

    if (!records.length) {
      tbody.innerHTML = `<tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
          <div class="empty-title">No records found</div>
          <div class="empty-text">Try adjusting your filters.</div>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr>
        <td><span class="table-order-id">#${r.orderId}</span></td>
        <td>${SELMS.utils.escapeHtml(r.customerName)}</td>
        <td>${SELMS.utils.escapeHtml(r.product)} <span class="table-cell-muted">×${r.qty}</span></td>
        <td>${SELMS.utils.escapeHtml(r.warehouse)}</td>
        <td>${SELMS.utils.escapeHtml(r.dest)}</td>
        <td style="font-family:'DM Mono',monospace">${SELMS.utils.formatCost(r.cost)}</td>
        <td>${SELMS.utils.priorityBadge(r.priority)}</td>
        <td>${SELMS.utils.statusBadge(r.status)}</td>
      </tr>
    `).join('');
  }
};

// ══════════════════════════════════════════════════════════
// PAGE: ROUTE OPTIMIZATION
// ══════════════════════════════════════════════════════════
SELMS.pages['routes'] = {
  _initialized: false,
  canvas: null,
  ctx: null,
  nodes: [],
  highlightedPath: [],

  init() {
    if (this._initialized) return;
    this._initialized = true;

    const canvas = document.getElementById('route-canvas');
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.setCanvasSize();
    this.computeNodePositions();
    this.draw();

    window.addEventListener('resize', () => {
      this.setCanvasSize();
      this.computeNodePositions();
      this.draw();
    });

    // Route selector
    const srcSel  = document.getElementById('route-src');
    const destSel = document.getElementById('route-dest');
    if (srcSel && destSel) {
      SELMS.data.cities.forEach(c => {
        [srcSel, destSel].forEach(s => {
          const o = document.createElement('option');
          o.value = c.node; o.textContent = c.name;
          s.appendChild(o);
        });
      });
      destSel.selectedIndex = 2;

      const run = () => {
        const src  = parseInt(srcSel.value);
        const dest = parseInt(destSel.value);
        this.runDijkstra(src, dest);
      };

      document.getElementById('run-dijkstra')?.addEventListener('click', run);
      srcSel.addEventListener('change', run);
      destSel.addEventListener('change', run);
      run();
    }
  },

  setCanvasSize() {
    const c = this.canvas;
    c.width  = c.offsetWidth;
    c.height = c.offsetHeight;
  },

  computeNodePositions() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const pad = 70;

    // Relative positions mimicking India map shape
    const relPos = [
      [0.15, 0.60], // Mumbai
      [0.22, 0.68], // Pune
      [0.45, 0.12], // Delhi
      [0.40, 0.78], // Bangalore
      [0.52, 0.82], // Chennai
      [0.42, 0.55], // Hyderabad
    ];

    this.nodes = SELMS.data.cities.map((c, i) => ({
      ...c,
      x: pad + relPos[i][0] * (W - pad * 2),
      y: pad + relPos[i][1] * (H - pad * 2),
    }));
  },

  draw(path = [], dist = {}) {
    const { ctx, canvas, nodes } = this;
    const edges = SELMS.data.edges;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 20; x < canvas.width; x += 30) {
      for (let y = 20; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Determine which edges are on the shortest path
    const pathEdges = new Set();
    for (let i = 0; i < path.length - 1; i++) {
      pathEdges.add(`${path[i]}-${path[i+1]}`);
      pathEdges.add(`${path[i+1]}-${path[i]}`);
    }

    // Draw edges
    edges.forEach(e => {
      const src  = nodes[e.src];
      const dest = nodes[e.dest];
      const onPath = pathEdges.has(`${e.src}-${e.dest}`);

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(dest.x, dest.y);

      if (onPath) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.shadowColor = 'rgba(245,158,11,0.5)';
        ctx.shadowBlur = 12;
      } else {
        ctx.strokeStyle = 'rgba(139,152,176,0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);

      // Edge cost label
      const mx = (src.x + dest.x) / 2;
      const my = (src.y + dest.y) / 2;
      ctx.font = onPath ? 'bold 11px "DM Mono"' : '10px "DM Mono"';
      ctx.fillStyle = onPath ? '#fbbf24' : 'rgba(139,152,176,0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.cost, mx, my - 9);
    });

    // Draw nodes
    nodes.forEach((node, i) => {
      const onPath = path.includes(i);
      const isStart = path[0] === i;
      const isEnd   = path[path.length - 1] === i;

      // Outer glow
      if (onPath) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = isStart ? 'rgba(16,185,129,0.15)' : isEnd ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)';
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);

      if (isStart) {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = 'rgba(16,185,129,0.6)';
        ctx.shadowBlur = 16;
      } else if (isEnd) {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = 'rgba(244,63,94,0.6)';
        ctx.shadowBlur = 16;
      } else if (onPath) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = 'rgba(245,158,11,0.5)';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#162443';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Node ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = onPath ? (isStart ? '#10b981' : isEnd ? '#f43f5e' : '#f59e0b') : 'rgba(139,152,176,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Node number
      ctx.font = 'bold 10px "DM Mono"';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i, node.x, node.y);

      // Label below
      const label = node.name;
      const distLabel = dist[i] !== undefined && dist[i] < Infinity ? ` (${dist[i]})` : '';
      ctx.font = onPath ? 'bold 12px "DM Sans"' : '11px "DM Sans"';
      ctx.fillStyle = onPath ? '#ffffff' : 'rgba(170,179,200,0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label + distLabel, node.x, node.y + 20);
    });
  },

  runDijkstra(src, dest) {
    const n  = SELMS.data.cities.length;
    const adj = Array.from({ length: n }, () => []);

    SELMS.data.edges.forEach(e => {
      adj[e.src].push({ node: e.dest, cost: e.cost });
      adj[e.dest].push({ node: e.src,  cost: e.cost });
    });

    const dist = Array(n).fill(Infinity);
    const prev = Array(n).fill(-1);
    dist[src] = 0;

    const visited = new Set();
    const pq = [[0, src]];

    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift();
      if (visited.has(u)) continue;
      visited.add(u);
      for (const { node: v, cost } of adj[u]) {
        if (dist[u] + cost < dist[v]) {
          dist[v] = dist[u] + cost;
          prev[v] = u;
          pq.push([dist[v], v]);
        }
      }
    }

    // Reconstruct path
    const path = [];
    let cur = dest;
    while (cur !== -1) { path.unshift(cur); cur = prev[cur]; }
    if (path[0] !== src) {
      // No path
      this.draw([], {});
      this.updateRouteInfo(src, dest, [], Infinity, dist);
      return;
    }

    this.draw(path, dist);
    this.updateRouteInfo(src, dest, path, dist[dest], dist);
  },

  updateRouteInfo(src, dest, path, totalCost, allDist) {
    const cities = SELMS.data.cities;

    const infoEl = document.getElementById('route-info');
    if (!infoEl) return;

    if (path.length < 2) {
      infoEl.innerHTML = `<p style="color:var(--rose-500)">No path found between selected cities.</p>`;
      return;
    }

    const pathStr = path.map(i => cities[i].name).join(' → ');

    infoEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <div style="font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--slate-400);margin-bottom:6px">Shortest Path</div>
          <div style="font-family:'DM Mono',monospace;font-size:0.82rem;color:var(--white);background:var(--navy-800);padding:10px 14px;border-radius:var(--radius-md);line-height:1.6">${pathStr}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:var(--navy-800);border-radius:var(--radius-md);padding:12px">
            <div style="font-size:0.68rem;color:var(--slate-400);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em">Total Cost</div>
            <div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:700;color:var(--amber-400)">${totalCost}</div>
          </div>
          <div style="background:var(--navy-800);border-radius:var(--radius-md);padding:12px">
            <div style="font-size:0.68rem;color:var(--slate-400);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em">Hops</div>
            <div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:700;color:var(--white)">${path.length - 1}</div>
          </div>
        </div>
        <div>
          <div style="font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--slate-400);margin-bottom:8px">All Distances from ${cities[src].name}</div>
          ${cities.map((c, i) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span style="font-size:0.8rem;color:${i === src ? 'var(--emerald-400)' : i === dest ? 'var(--rose-400)' : 'var(--slate-300)'}">${c.name}</span>
              <span style="font-family:'DM Mono',monospace;font-size:0.78rem;color:var(--amber-400)">${allDist[i] === Infinity ? '∞' : allDist[i]}</span>
            </div>
          `).join('')}
        </div>
        <div style="font-size:0.72rem;color:var(--navy-500);padding-top:4px;font-family:'DM Mono',monospace">Algorithm: Dijkstra's · O((V+E) log V)</div>
      </div>
    `;
  }
};

// ── Spin animation for loading button ──
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);
