# NodeVault - SCD Project

**NodeVault** is a Node.js-based Command Line Interface (CLI) application designed for secure record management. This project demonstrates advanced Software Construction and Development (SCD) concepts, including MongoDB integration, environment configuration, and full containerization using Docker and Docker Compose.

## 🚀 Project Overview

Originally a simple in-memory CRUD application, this project has been refactored and enhanced to simulate a real-world production environment. It includes robust data handling, automatic backups, and a containerized deployment strategy to solve environment inconsistency issues.

### Key Features
* **CRUD Operations:** Create, Read, Update, and Delete secure records.
* **🔍 Search Functionality:** Case-insensitive search by Name or ID.
* **📊 Sorting:** Sort records by Name or ID in Ascending or Descending order.
* **📂 Data Export:** Export the entire vault to a formatted `export.txt` file.
* **💾 Automatic Backups:** Automatically creates JSON snapshots in `/backups` whenever data is modified.
* **📈 Vault Statistics:** View real-time analytics (Total records, last modified, oldest/newest entries).
* **🛢️ MongoDB Integration:** Persistent storage replacing the in-memory database.
* **🐳 Dockerized:** Fully containerized backend with Docker and Docker Compose.

---

## 🛠️ Tech Stack
* **Runtime:** Node.js (v18 Alpine)
* **Database:** MongoDB
* **Containerization:** Docker & Docker Compose
* **Dependencies:** `dotenv`, `mongodb`, `express` (for verification)

---

## ⚙️ Installation & Local Setup

### Prerequisites
* Node.js (v18+)
* MongoDB installed locally or a cloud URI
* Docker Desktop (optional, for containerization)

### Steps
1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/HamasNaveed/SCD_Project.git](https://github.com/HamasNaveed/SCD_Project.git)
    cd SCD_Project
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    # MongoDB Configuration
    MONGODB_CONNECTION_STRING=mongodb://localhost:27017
    MONGODB_DATABASE_NAME=nodevault
    MONGODB_COLLECTION_NAME=records

    # Application Settings
    NODE_ENV=development
    ```

4.  **Run the Application (CLI)**
    ```bash
    node main.js
    ```

---

## 🐳 Docker Deployment

This project includes a fully automated deployment setup using Docker Compose, creating a private network for the App and Database.

### Option 1: Using Docker Compose (Recommended)
This method sets up the Node.js application and a MongoDB container automatically.

1.  **Build and Run**
    ```bash
    docker-compose up --build -d
    ```

2.  **Verify Containers**
    ```bash
    docker ps
    ```
    *You should see `nodevault-app` and `mongodb` running.*

3.  **Interact with the App**
    Since this is a CLI app running inside a container, you can interact with it via:
    ```bash
    docker attach <container_id_of_nodevault-app>
    ```
    *Or verify it via the Express verification endpoint:*
    Open `http://localhost:3000` in your browser.

4.  **Stop Containers**
    ```bash
    docker-compose down
    ```

### Option 2: Manual Docker Run
If you prefer running containers manually:

1.  **Create Network**
    ```bash
    docker network create nodevault-network
    ```
2.  **Run MongoDB**
    ```bash
    docker run -d --name mongodb --network nodevault-network -v mongodb-data:/data/db mongo:latest
    ```
3.  **Run Application**
    ```bash
    docker run -d --name nodevault-app --network nodevault-network -e MONGODB_CONNECTION_STRING=mongodb://mongodb:27017 hamasnaveed/nodevault-app:v1
    ```

---

