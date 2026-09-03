package com.example.selms;
import java.util.*;

// ==================== CUSTOMER ====================
class Customer {
    int id;
    String name;
    int cityNode; // maps to graph node

    Customer(int id, String name, int cityNode) {
        this.id = id;
        this.name = name;
        this.cityNode = cityNode;
    }
}

// ==================== ORDER ====================
class Order {
    int orderId;
    int customerId;
    String product;
    int quantity;
    String priority;

    Order(int orderId, int customerId, String product, int quantity, String priority) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.product = product;
        this.quantity = quantity;
        this.priority = priority;
    }
}

// ==================== DELIVERY RECORD ====================
class DeliveryRecord {
    Order order;
    String warehouseCity;
    String customerName;
    int deliveryCost;
    int warehouseNode;
    int customerNode;

    DeliveryRecord(Order order, String warehouseCity, String customerName,
                   int deliveryCost, int warehouseNode, int customerNode) {
        this.order = order;
        this.warehouseCity = warehouseCity;
        this.customerName = customerName;
        this.deliveryCost = deliveryCost;
        this.warehouseNode = warehouseNode;
        this.customerNode = customerNode;
    }
}

// ==================== WAREHOUSE ====================
class Warehouse {
    int id;
    String city;
    int cityNode; // maps to graph node
    TreeMap<String, Integer> inventory; // BST - O(log n) operations

    Warehouse(int id, String city, int cityNode) {
        this.id = id;
        this.city = city;
        this.cityNode = cityNode;
        this.inventory = new TreeMap<>(); // TreeMap = Red-Black BST
    }

    // BST feature: get all products in sorted order (alphabetical)
    void displaySortedInventory() {
        System.out.println("  [Warehouse: " + city + "] Inventory (BST sorted):");
        for (Map.Entry<String, Integer> e : inventory.entrySet()) {
            System.out.println("    - " + e.getKey() + ": " + e.getValue() + " units");
        }
    }

    // BST feature: range query - find all products between two keys
    void displayInventoryRange(String from, String to) {
        System.out.println("  Products [" + from + " to " + to + "]: "
                + inventory.subMap(from, true, to, true));
    }
}

// ==================== EDGE (GRAPH) ====================
class Edge {
    int dest;
    int cost;

    Edge(int dest, int cost) {
        this.dest = dest;
        this.cost = cost;
    }
}

// ==================== SMART LOGISTICS SYSTEM ====================
public class SmartLogisticsSystem {

    // --- Core Data Structures ---
    static HashMap<Integer, Customer> customers = new HashMap<>();   // O(1) lookup
    static HashMap<Integer, Warehouse> warehouses = new HashMap<>(); // O(1) lookup
    static HashMap<Integer, String> cityNames = new HashMap<>();     // node -> city name

    // Adjacency List Graph
    static ArrayList<ArrayList<Edge>> graph = new ArrayList<>();
    static int V; // number of nodes (cities)

    // Priority Queue: PREMIUM > URGENT > NORMAL  [Max-Heap by priority]
    static PriorityQueue<Order> orderQueue = new PriorityQueue<>(
        (a, b) -> getPriority(b.priority) - getPriority(a.priority)
    );

    // FIFO Queue: confirmed deliveries in processing sequence
    static Queue<DeliveryRecord> deliveryQueue = new LinkedList<>();

    // ==================== PRIORITY MAPPING ====================
    static int getPriority(String p) {
        switch (p.toUpperCase()) {
            case "PREMIUM": return 3;
            case "URGENT":  return 2;
            default:        return 1; // NORMAL
        }
    }

    // ==================== SETUP HELPERS ====================
    static void initGraph(int nodes) {
        V = nodes;
        for (int i = 0; i < V; i++) {
            graph.add(new ArrayList<>());
        }
    }

    static void addCity(int node, String name) {
        cityNames.put(node, name);
    }

    static void addCustomer(int id, String name, int cityNode) {
        customers.put(id, new Customer(id, name, cityNode)); // O(1)
    }

    static void addWarehouse(int id, String city, int cityNode) {
        warehouses.put(id, new Warehouse(id, city, cityNode)); // O(1)
    }

    static void addInventory(int wid, String product, int qty) {
        warehouses.get(wid).inventory.put(product, qty); // O(log n) - BST insert
    }

    static void addEdge(int src, int dest, int cost) {
        graph.get(src).add(new Edge(dest, cost));
        graph.get(dest).add(new Edge(src, cost)); // undirected
    }

    static void placeOrder(Order o) {
        orderQueue.add(o); // O(log n) - heap insert
        System.out.println("  Order #" + o.orderId + " placed ["
                + o.priority + "] | " + o.product + " x" + o.quantity);
    }

    // ==================== DIJKSTRA'S ALGORITHM ====================
    // Time Complexity: O((V + E) log V)
    // Returns shortest distances from `src` to all nodes
    static int[] dijkstra(int src) {
        int[] dist = new int[V];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;

        // Min-heap: [node, distance]
        PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        minHeap.add(new int[]{src, 0});

        while (!minHeap.isEmpty()) {
            int[] curr = minHeap.poll();         // O(log V)
            int node = curr[0], d = curr[1];

            if (d > dist[node]) continue;        // stale entry, skip

            for (Edge e : graph.get(node)) {     // O(E) total across all iterations
                if (dist[node] + e.cost < dist[e.dest]) {
                    dist[e.dest] = dist[node] + e.cost;
                    minHeap.add(new int[]{e.dest, dist[e.dest]}); // O(log V)
                }
            }
        }
        return dist;
    }

    // ==================== FIND OPTIMAL WAREHOUSE ====================
    // Finds warehouse that has stock AND is closest to the customer
    // Time Complexity: O(W * (V+E) log V) where W = number of warehouses
    static int findOptimalWarehouse(String product, int qty, int customerNode) {
        int bestWarehouseId = -1;
        int bestCost = Integer.MAX_VALUE;

        for (Warehouse w : warehouses.values()) {
            // BST lookup: O(log n)
            if (w.inventory.containsKey(product) && w.inventory.get(product) >= qty) {
                // Run Dijkstra from this warehouse node
                int[] dist = dijkstra(w.cityNode);
                int costToCustomer = dist[customerNode];

                if (costToCustomer < bestCost) {
                    bestCost = costToCustomer;
                    bestWarehouseId = w.id;
                }
            }
        }
        return bestWarehouseId;
    }

    // ==================== PROCESS ALL ORDERS ====================
    static void processOrders() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("         PROCESSING ORDERS (Priority Queue)");
        System.out.println("=".repeat(60));

        int processed = 0, failed = 0;

        while (!orderQueue.isEmpty()) {
            Order o = orderQueue.poll(); // O(log n) - heap extract-max
            Customer c = customers.get(o.customerId); // O(1) - HashMap

            System.out.println("\n>> Order #" + o.orderId
                    + " [" + o.priority + "] | Customer: " + c.name
                    + " | " + o.product + " x" + o.quantity);

            // Find nearest warehouse with stock - using Dijkstra
            int wid = findOptimalWarehouse(o.product, o.quantity, c.cityNode);

            if (wid == -1) {
                System.out.println("   STATUS: ❌ FAILED — Insufficient stock across all warehouses");
                failed++;
                continue;
            }

            Warehouse w = warehouses.get(wid);

            // Run Dijkstra one final time to get cost
            int[] dist = dijkstra(w.cityNode);
            int deliveryCost = dist[c.cityNode];

            System.out.println("   Warehouse  : " + w.city + " (Node " + w.cityNode + ")");
            System.out.println("   Destination: " + cityNames.get(c.cityNode)
                    + " (Node " + c.cityNode + ")");
            System.out.println("   Delivery Cost (Dijkstra): " + deliveryCost);

            // Update inventory — O(log n) BST update
            int oldQty = w.inventory.get(o.product);
            w.inventory.put(o.product, oldQty - o.quantity);
            System.out.println("   Inventory Updated: " + o.product
                    + " → " + oldQty + " → " + (oldQty - o.quantity) + " units");

            System.out.println("   STATUS: ✅ CONFIRMED & DISPATCHED");

            // Enqueue to delivery pipeline — O(1)
            deliveryQueue.add(new DeliveryRecord(o, w.city, c.name,
                    deliveryCost, w.cityNode, c.cityNode));
            processed++;
        }

        System.out.println("\n  Summary: " + processed + " dispatched, " + failed + " failed.");
    }

    // ==================== DISPLAY DELIVERIES ====================
    static void showDeliveries() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("         DELIVERY PIPELINE (FIFO Queue)");
        System.out.println("=".repeat(60));
        int i = 1;
        for (DeliveryRecord dr : deliveryQueue) {
            System.out.println(i++ + ". Order #" + dr.order.orderId
                    + " | " + dr.order.product + " x" + dr.order.quantity
                    + " | " + dr.warehouseCity + " → " + cityNames.get(dr.customerNode)
                    + " | Cost: " + dr.deliveryCost
                    + " | Priority: " + dr.order.priority);
        }
    }

    // ==================== DISPLAY INVENTORY (BST) ====================
    static void showAllInventory() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("    WAREHOUSE INVENTORY (TreeMap / BST - Sorted)");
        System.out.println("=".repeat(60));
        for (Warehouse w : warehouses.values()) {
            w.displaySortedInventory();
        }
    }

    // ==================== COMPLEXITY ANALYSIS ====================
    static void showComplexityAnalysis() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("         TIME COMPLEXITY ANALYSIS");
        System.out.println("=".repeat(60));
        System.out.println("  Data Structure        | Operation       | Complexity");
        System.out.println("  ---------------------|-----------------|------------");
        System.out.println("  HashMap (customers)   | Lookup/Insert   | O(1)");
        System.out.println("  PriorityQueue (orders)| Insert/Extract  | O(log n)");
        System.out.println("  TreeMap (inventory)   | Lookup/Insert   | O(log n)");
        System.out.println("  Graph (Adj. List)     | Build           | O(V + E)");
        System.out.println("  Dijkstra's Algorithm  | Shortest Path   | O((V+E) log V)");
        System.out.println("  LinkedList Queue      | Enqueue/Dequeue | O(1)");
        System.out.println("\n  Overall Order Processing: O(W * (V+E) log V) per order");
        System.out.println("  where W = warehouses, V = cities, E = routes");
    }

    // ==================== MAIN ====================
    public static void main(String[] args) {

        System.out.println("=".repeat(60));
        System.out.println("   SMART ENTERPRISE LOGISTICS & ORDER PROCESSING SYSTEM");
        System.out.println("=".repeat(60));

        // --- Graph: 6 city nodes ---
        // 0=Mumbai, 1=Pune, 2=Delhi, 3=Bangalore, 4=Chennai, 5=Hyderabad
        initGraph(6);
        addCity(0, "Mumbai");
        addCity(1, "Pune");
        addCity(2, "Delhi");
        addCity(3, "Bangalore");
        addCity(4, "Chennai");
        addCity(5, "Hyderabad");

        // --- Customers (mapped to city nodes) ---
        addCustomer(1, "Aanchal", 0); // Mumbai
        addCustomer(2, "Rahul",   2); // Delhi
        addCustomer(3, "Priya",   3); // Bangalore

        // --- Warehouses (each located in a city node) ---
        addWarehouse(0, "Mumbai",    0);
        addWarehouse(1, "Pune",      1);
        addWarehouse(2, "Delhi",     2);
        addWarehouse(3, "Bangalore", 3);
        addWarehouse(4, "Chennai",   4);

        // --- Inventory (TreeMap BST: O(log n) insert) ---
        addInventory(0, "Laptop",  5);
        addInventory(0, "Charger", 20);
        addInventory(1, "Laptop",  10);
        addInventory(1, "Phone",   15);
        addInventory(2, "Phone",   8);
        addInventory(2, "Tablet",  6);
        addInventory(3, "Laptop",  3);
        addInventory(3, "Headphones", 12);
        addInventory(4, "Phone",   10);

        // --- Transportation Network (undirected weighted graph) ---
        addEdge(0, 1, 4);   // Mumbai - Pune
        addEdge(1, 2, 6);   // Pune - Delhi
        addEdge(0, 3, 10);  // Mumbai - Bangalore
        addEdge(3, 4, 3);   // Bangalore - Chennai
        addEdge(2, 4, 7);   // Delhi - Chennai
        addEdge(0, 5, 5);   // Mumbai - Hyderabad
        addEdge(5, 3, 4);   // Hyderabad - Bangalore
        addEdge(2, 5, 8);   // Delhi - Hyderabad

        // --- Show initial inventory (BST sorted) ---
        showAllInventory();

        // --- Place Orders ---
        System.out.println("\n" + "=".repeat(60));
        System.out.println("         PLACING ORDERS");
        System.out.println("=".repeat(60));
        placeOrder(new Order(101, 1, "Laptop",  2, "PREMIUM"));
        placeOrder(new Order(102, 2, "Phone",   1, "URGENT"));
        placeOrder(new Order(103, 1, "Laptop",  1, "NORMAL"));
        placeOrder(new Order(104, 3, "Tablet",  2, "URGENT"));
        placeOrder(new Order(105, 2, "Headphones", 5, "NORMAL"));

        // --- Process in priority order ---
        processOrders();

        // --- Show delivery pipeline ---
        showDeliveries();

        // --- Show updated inventory after all orders ---
        System.out.println("\n--- Inventory after order processing ---");
        showAllInventory();

        // --- Complexity Summary ---
        showComplexityAnalysis();

        // --- BST Range Query Demo ---
        System.out.println("\n" + "=".repeat(60));
        System.out.println("    BST RANGE QUERY DEMO (TreeMap.subMap)");
        System.out.println("=".repeat(60));
        warehouses.get(1).displayInventoryRange("Laptop", "Phone"); // Pune warehouse
    }
}