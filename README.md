# Buffer-7.0
# Smart Enterprise Logistics & Order Processing System (SELMS)

## 📌 Project Overview

Smart Enterprise Logistics & Order Processing System (SELMS) is an enterprise-level logistics management platform designed to optimize order processing, warehouse allocation, inventory management, and delivery route optimization using advanced Data Structures and Algorithms.

This system simulates real-world logistics platforms like Amazon, Flipkart, and DHL.

---

## 🏷 Domain

**Enterprise Systems & Process Optimization**

This project focuses on optimizing enterprise-level logistics operations by automating:

* Order prioritization
* Warehouse allocation
* Inventory management
* Delivery route optimization
* Real-time tracking and analytics

It improves operational efficiency, reduces delivery costs, and enhances customer satisfaction in large-scale enterprise systems.

---

## 🎯 Features

* Add and manage customers dynamically
* Add and manage products dynamically
* Place new orders with priority levels
* Process PREMIUM orders before URGENT and NORMAL
* Select optimal warehouse based on stock and shortest delivery route
* Real-time inventory tracking and updates
* Delivery tracking pipeline
* Route optimization using Dijkstra’s Algorithm
* Warehouse inventory display using BST (TreeMap)
* Dashboard analytics and performance visualization

---

## 🧠 Data Structures & Algorithms Used

### 1. HashMap

Used for:

* Fast customer lookup
* Fast warehouse lookup
* City mapping

**Time Complexity:** O(1)

---

### 2. Priority Queue (Heap)

Used for:

* Processing high-priority orders first

Priority order:

PREMIUM > URGENT > NORMAL

**Time Complexity:** O(log n)

---

### 3. Graph (Adjacency List)

Used for:

* Representing transportation network between cities

**Time Complexity:** O(V + E)

---

### 4. Dijkstra’s Algorithm

Used for:

* Finding shortest / cheapest delivery route

**Time Complexity:** O((V + E) log V)

---

### 5. TreeMap (BST / Red-Black Tree)

Used for:

* Inventory management in sorted order
* Range queries on products

**Time Complexity:** O(log n)

---

### 6. Queue (FIFO)

Used for:

* Delivery processing pipeline

**Time Complexity:** O(1)

---

## ⚙️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Java
* Spring Boot
* Thymeleaf

### Build Tool

* Maven

---

## 📂 Project Structure

```bash
SELMS/
│
├── src/
│   ├── main/
│   │   ├── java/com/example/selms/
│   │   │   ├── SelmsApplication.java
│   │   │   ├── HomeController.java
│   │   │   └── SmartLogisticsSystem.java
│   │   │
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   └── js/
│   │       │
│   │       └── templates/
│   │           └── index.html
│
├── pom.xml
└── README.md
```

---

## 🚀 How to Run the Project

### Step 1: Clone Repository

```bash
git clone <repository-link>
cd SELMS
```

### Step 2: Install Dependencies

```bash
mvn clean install
```

### Step 3: Run Application

```bash
mvn spring-boot:run
```

### Step 4: Open Browser

```bash
http://localhost:8081
```

(or the configured port)

---

## 📊 Complexity Analysis

| Operation        | Complexity     |
| ---------------- | -------------- |
| Customer Lookup  | O(1)           |
| Warehouse Lookup | O(1)           |
| Order Insert     | O(log n)       |
| Order Process    | O(log n)       |
| Inventory Update | O(log n)       |
| Shortest Path    | O((V+E) log V) |

---

## 🌍 Real World Relevance

This project can be used in:

* E-commerce logistics
* Warehouse management systems
* Supply chain optimization
* Courier / delivery services

Examples:

* Amazon
* Flipkart
* DHL

---

## 👨‍💻 Team Members

* Aabha Joshi
* Aishwarya Marshettiwar
* Aanchal Hargunani

---

## 📌 Future Enhancements

* Database integration (MySQL / MongoDB)
* Real-time order notifications
* AI-based delivery prediction
* Secure login/authentication
* Live map API integration
