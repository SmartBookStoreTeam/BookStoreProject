# Smart Online Bookstore

![Project Badge](https://img.shields.io/badge/status-Active-brightgreen)

> **Smart Online Bookstore** — a responsive, AI-assisted e-commerce platform for discovering, previewing, and purchasing books with personalized recommendations and a modern admin dashboard.

---

## Table of Contents

* [About](#about)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Architecture & Concepts](#architecture--concepts)
* [Screenshots](#screenshots)
* [Team](#team)
* [Contributing](#contributing)
* [License](#license)

---

## About

**Smart Online Bookstore** is a full-stack web application that helps readers find books they love. It combines a modern, mobile-first UI with smart features like *personalized recommendations*, *search with fuzzy matching*, and an *admin panel* for inventory and order management.

**One-line header:** *A smarter, friendlier way to discover and buy books online.*

---

## Features

* **Intelligent recommendations** using user behavior and genre similarity.
* **Responsive storefront** with filters, sorting, and book previews (sample chapters).
* **Secure checkout** and order history.
* **Admin dashboard** for managing books, categories, discounts, and viewing analytics.
* **User profiles** with reading lists, reviews, and ratings.
* **Search** with autocomplete and fuzzy matching.

---

## Tech Stack

### **Cloud & DevOps**

* **AWS Services:** EC2, S3, RDS, IAM, CloudFront, Lambda (optional), API Gateway
* **Infrastructure as Code:** Terraform
* **Containerization:** Docker
* **CI/CD Pipelines:** GitHub Actions (or AWS CodePipeline)
* **Monitoring/Logging:** CloudWatch, AWS X-Ray
* **Frontend:** React (functional components + hooks), Tailwind CSS
* **Backend:** Node.js + Express or Django/Flask (choose preferred), RESTful API
* **Database:** MongoDB synced with DocumentDB on AWS.
* **Auth:** JWT (or OAuth for social login)
* **Hosting / Infra:** Docker, CI/CD (GitHub Actions), static assets via CDN

---

## Architecture & Concepts

1. **Client-Server separation:** React SPA communicates with REST API for product catalog, user auth, and orders.
2. **Recommendation engine:** Hybrid approach (collaborative filtering + content-based) to present personalized lists.
3. **Caching & performance:** CDN for images, server-side pagination, and Redis for session/cache where needed.
4. **Security:** Input validation, HTTPS enforcement, rate limiting, and secure storage of secrets.

---

## Screenshots

### 🏠 Homepage
![Homepage](/assets/screenshots/homepage.png)

### 📚 Book Details Page
![Book Page](/assets/screenshots/book_page.png)

### 🔍 Search & Filters
![Search and Filters](/assets/screenshots/search_filters.png)

### 🛒 Cart & Checkout
![Checkout](/assets/screenshots/checkout.png)

### 🛠️ Admin Dashboard
![Admin Dashboard](/assets/screenshots/admin_dashboard.png)

---

## Team

### **Development Team**

* ***Frontend Developer - Ibrahim Reda*** — Builds the UI, user flows, and components.
* ***Backend Developer - Samy Elsayed*** — Implements API, database, authentication, and business logic.

### **Cloud & DevOps Team**

* ***Cloud/DevOps Engineer 1 - Ziad Fawzi*** — AWS infrastructure, Terraform automation, Docker images, deployments.
* ***Cloud/DevOps Engineer 2 - Ziad Hany*** — CI/CD pipelines, monitoring, scaling, environment setup.



---


## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Open a PR with a clear description and linked issue.
3. Add tests and ensure CI passes.

Please follow the repository's code style and commit message guidelines.

---

## License

This project is released under the **MIT License**.

---

*Last updated: 2025-12-08*
