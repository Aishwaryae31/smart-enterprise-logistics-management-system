// ============================================================
// SELMS — Smart Enterprise Logistics Management System
// data.js — Seed data (replace with Spring Boot API calls)
// ============================================================

window.SELMS = window.SELMS || {};

SELMS.data = {

  // ── Stats ──────────────────────────────────────────────
  stats: {
    totalOrders:     247,
    pendingOrders:   34,
    deliveredOrders: 198,
    failedOrders:    15,
    totalRevenue:    '₹18,42,600',
    avgDeliveryCost: 742,
    warehouseCount:  5,
    activeRoutes:    12,
  },

  // ── Cities / Graph Nodes ────────────────────────────────
  cities: [
    { node: 0, name: 'Mumbai',    lat: 19.076,  lng: 72.877  },
    { node: 1, name: 'Pune',      lat: 18.520,  lng: 73.856  },
    { node: 2, name: 'Delhi',     lat: 28.613,  lng: 77.209  },
    { node: 3, name: 'Bangalore', lat: 12.972,  lng: 77.594  },
    { node: 4, name: 'Chennai',   lat: 13.082,  lng: 80.270  },
    { node: 5, name: 'Hyderabad', lat: 17.385,  lng: 78.486  },
  ],

  // ── Graph Edges ─────────────────────────────────────────
  edges: [
    { src: 0, dest: 1, cost: 4,  label: '4 units' },
    { src: 1, dest: 2, cost: 6,  label: '6 units' },
    { src: 0, dest: 3, cost: 10, label: '10 units' },
    { src: 3, dest: 4, cost: 3,  label: '3 units' },
    { src: 2, dest: 4, cost: 7,  label: '7 units' },
    { src: 0, dest: 5, cost: 5,  label: '5 units' },
    { src: 5, dest: 3, cost: 4,  label: '4 units' },
    { src: 2, dest: 5, cost: 8,  label: '8 units' },
  ],

  // ── Customers ───────────────────────────────────────────
  customers: [
    { id: 1, name: 'Aanchal Sharma',  cityNode: 0, city: 'Mumbai',    email: 'aanchal@corp.in',   phone: '+91 98200 11234' },
    { id: 2, name: 'Rahul Mehra',     cityNode: 2, city: 'Delhi',     email: 'rahul.m@corp.in',   phone: '+91 98110 55678' },
    { id: 3, name: 'Priya Iyer',      cityNode: 3, city: 'Bangalore', email: 'priya.i@corp.in',   phone: '+91 80933 78901' },
    { id: 4, name: 'Suresh Nair',     cityNode: 4, city: 'Chennai',   email: 'suresh.n@corp.in',  phone: '+91 94440 12340' },
    { id: 5, name: 'Kavitha Reddy',   cityNode: 5, city: 'Hyderabad', email: 'kavitha@corp.in',   phone: '+91 99590 67890' },
  ],

  // ── Warehouses ──────────────────────────────────────────
  warehouses: [
    {
      id: 0, name: 'WH-MUM-01', city: 'Mumbai', cityNode: 0,
      inventory: [
        { product: 'Laptop',  qty: 5,  maxQty: 30 },
        { product: 'Charger', qty: 20, maxQty: 50 },
      ]
    },
    {
      id: 1, name: 'WH-PUN-01', city: 'Pune', cityNode: 1,
      inventory: [
        { product: 'Laptop', qty: 10, maxQty: 30 },
        { product: 'Phone',  qty: 15, maxQty: 40 },
      ]
    },
    {
      id: 2, name: 'WH-DEL-01', city: 'Delhi', cityNode: 2,
      inventory: [
        { product: 'Phone',  qty: 8, maxQty: 40 },
        { product: 'Tablet', qty: 6, maxQty: 25 },
      ]
    },
    {
      id: 3, name: 'WH-BLR-01', city: 'Bangalore', cityNode: 3,
      inventory: [
        { product: 'Laptop',     qty: 3,  maxQty: 30 },
        { product: 'Headphones', qty: 12, maxQty: 30 },
      ]
    },
    {
      id: 4, name: 'WH-CHN-01', city: 'Chennai', cityNode: 4,
      inventory: [
        { product: 'Phone',  qty: 10, maxQty: 40 },
        { product: 'Tablet', qty: 2,  maxQty: 25 },
      ]
    },
  ],

  // ── Orders ──────────────────────────────────────────────
  orders: [
    { orderId: 101, customerId: 1, customerName: 'Aanchal Sharma', product: 'Laptop',     qty: 2, priority: 'PREMIUM', status: 'DISPATCHED',  warehouseId: 1, warehouseName: 'WH-PUN-01', deliveryCost: 4,  date: '2025-07-10' },
    { orderId: 102, customerId: 2, customerName: 'Rahul Mehra',    product: 'Phone',      qty: 1, priority: 'URGENT',  status: 'DELIVERED',   warehouseId: 2, warehouseName: 'WH-DEL-01', deliveryCost: 0,  date: '2025-07-10' },
    { orderId: 103, customerId: 1, customerName: 'Aanchal Sharma', product: 'Laptop',     qty: 1, priority: 'NORMAL',  status: 'DISPATCHED',  warehouseId: 1, warehouseName: 'WH-PUN-01', deliveryCost: 4,  date: '2025-07-09' },
    { orderId: 104, customerId: 3, customerName: 'Priya Iyer',     product: 'Tablet',     qty: 2, priority: 'URGENT',  status: 'FAILED',      warehouseId: -1, warehouseName: '—',         deliveryCost: 0,  date: '2025-07-09' },
    { orderId: 105, customerId: 2, customerName: 'Rahul Mehra',    product: 'Headphones', qty: 5, priority: 'NORMAL',  status: 'PENDING',     warehouseId: 3, warehouseName: 'WH-BLR-01', deliveryCost: 15, date: '2025-07-08' },
    { orderId: 106, customerId: 4, customerName: 'Suresh Nair',    product: 'Charger',    qty: 3, priority: 'NORMAL',  status: 'DELIVERED',   warehouseId: 0, warehouseName: 'WH-MUM-01', deliveryCost: 13, date: '2025-07-08' },
    { orderId: 107, customerId: 5, customerName: 'Kavitha Reddy',  product: 'Phone',      qty: 2, priority: 'URGENT',  status: 'DISPATCHED',  warehouseId: 4, warehouseName: 'WH-CHN-01', deliveryCost: 7,  date: '2025-07-07' },
    { orderId: 108, customerId: 3, customerName: 'Priya Iyer',     product: 'Laptop',     qty: 1, priority: 'PREMIUM', status: 'DELIVERED',   warehouseId: 3, warehouseName: 'WH-BLR-01', deliveryCost: 0,  date: '2025-07-07' },
  ],

  // ── Delivery Pipeline ────────────────────────────────────
  deliveryRecords: [
    { orderId: 101, customerName: 'Aanchal Sharma', product: 'Laptop',     qty: 2, warehouse: 'WH-PUN-01', dest: 'Mumbai',    cost: 4,  priority: 'PREMIUM', status: 'IN_TRANSIT' },
    { orderId: 102, customerName: 'Rahul Mehra',    product: 'Phone',      qty: 1, warehouse: 'WH-DEL-01', dest: 'Delhi',     cost: 0,  priority: 'URGENT',  status: 'DELIVERED'  },
    { orderId: 103, customerName: 'Aanchal Sharma', product: 'Laptop',     qty: 1, warehouse: 'WH-PUN-01', dest: 'Mumbai',    cost: 4,  priority: 'NORMAL',  status: 'IN_TRANSIT' },
    { orderId: 105, customerName: 'Rahul Mehra',    product: 'Headphones', qty: 5, warehouse: 'WH-BLR-01', dest: 'Delhi',     cost: 15, priority: 'NORMAL',  status: 'PROCESSING' },
    { orderId: 106, customerName: 'Suresh Nair',    product: 'Charger',    qty: 3, warehouse: 'WH-MUM-01', dest: 'Chennai',   cost: 13, priority: 'NORMAL',  status: 'DELIVERED'  },
    { orderId: 107, customerName: 'Kavitha Reddy',  product: 'Phone',      qty: 2, warehouse: 'WH-CHN-01', dest: 'Hyderabad', cost: 7,  priority: 'URGENT',  status: 'IN_TRANSIT' },
    { orderId: 108, customerName: 'Priya Iyer',     product: 'Laptop',     qty: 1, warehouse: 'WH-BLR-01', dest: 'Bangalore', cost: 0,  priority: 'PREMIUM', status: 'DELIVERED'  },
  ],

  // ── Analytics / Chart Data ───────────────────────────────
  chartData: {
    labels:     ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    orderCosts: [320,   580,   420,   690,   510,   440,   760],
    orderCounts:[8,     14,    10,    17,    12,    11,    19],
  },

  // ── Products List ────────────────────────────────────────
  products: ['Laptop', 'Phone', 'Tablet', 'Charger', 'Headphones', 'Monitor', 'Keyboard', 'Mouse'],
};
