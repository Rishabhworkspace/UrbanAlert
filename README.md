# UrbanAlert - Smart Civic Reporting Platform

UrbanAlert is a modern, responsive web application designed to bridge the communications gap between citizens and local government authorities. The platform empowers residents to seamlessly report civic issues such as infrastructure damage, public hazards, and sanitation emergencies, while providing government officials with a robust, data-driven administrative dashboard to manage community workflows.

By leveraging real-time GPS tracking, reverse geocoding, and AI-powered triage analysis, UrbanAlert drastically reduces the response latency for municipal authorities while maintaining full transparency with the reporting citizens.

## System Features

### Citizen Portal Features
- **Intuitive Issue Reporting:** A streamlined interface for submitting reports with automated location detection (GPS integration) and secure media/image uploads.
- **Geospatial Mapping Integration:** Automatic translation of device coordinates into localized address data to provide highly accurate location mapping for city officers.
- **Urgency Controls:** Users possess the ability to manually flag severe and immediate public safety hazards for priority assessment.
- **Community Upvoting & Feed:** A comprehensive public feed where users can track, search, and upvote civic issues reported by other members of the community, fostering cooperative civic engagement.
- **Real-Time Issue Tracking:** Individual dashboards for residents to strictly track the live resolution pipeline of their reported issues, complete with direct status updates and official government notes.

### Government Administrative Portal Features
- **Interactive Live Tracking Map:** A real-time, interactive Leaflet-powered geographical overview plotting every submitted issue, clustered visually by status, priority, and date reported.
- **In-Depth System Analytics:** Dynamic visual representations (utilizing Recharts) of civic data allowing officers to monitor issue distribution by category, triage level, and resolution efficiency over time.
- **Pipeline Kanban Dashboard:** An efficient management interface where officials can easily advance issues through dynamic statuses (Reported to In Progress to Resolved).
- **AI-Powered Priority Triage:** Background LLM integrations that analyze user text descriptions to automatically tag reports and suggest urgency levels, ensuring high-priority emergencies do not get lost in heavily populated queues.
- **Direct Citizen Communication:** Support for officials to attach public-facing notes when updating ticket statuses, providing specific context to the original reporter.

## Architecture & Technology Stack

UrbanAlert relies on a modern full-stack web architecture, strictly decoupled between frontend client interfaces and backend REST APIs.

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router (DOM)
- **Mapping & Data Viz:** React Leaflet, Recharts
- **Icons:** Lucide React

### Backend
- **Environment:** Node.js, Express.js
- **Database:** MongoDB (utilizing Mongoose ORM with 2dsphere indexing for advanced spatial querying)
- **Authentication:** Secure JWT-based pipelines with strict Role-Based Access Control (RBAC) differentiating Citizen versus Officer routes.
- **AI Triage Integration:** Large Language Model endpoints dedicated to parsing plain-text infrastructure damage for priority mapping.
- **Media Transcoding & Storage:** Cloudinary integration (via Multer) securely capturing and hosting citizen photographic evidence.
- **Geocoding Pipelines:** Nominatim reverse geocoding to programmatically resolve GPS coordinates to authenticated street addresses.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Database Instance (Atlas or Local Daemon)
- Cloudinary Account Configuration (for image hosting)

### 1. Installation

Clone the repository and install dependency paths for both the server and client wrappers:

```bash
# Clone the repository
git clone https://github.com/Rishabhworkspace/UrbanAlert.git
cd UrbanAlert

# Install Backend Node dependencies
cd backend
npm install

# Install Frontend Vite dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create a `.env` file within the `/backend` directory and add the essential integration keys:

```env
# Backend Server Port Configuration
PORT=5000

# MongoDB URI String
MONGODB_URI=your_mongodb_connection_string

# Authentication Secrets
JWT_SECRET=your_jwt_secret_key

# Cloudinary Integration Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Executing the Environment

Initialize both the frontend and backend servers asynchronously in separate terminal instances:

**Terminal 1 (Backend Initialization):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Initialization):**
```bash
cd client
npm run dev
```

The frontend application routing will be accessible immediately via `http://localhost:5173`, with the backend API communicating on port `5000`.

## Contributing Information

Contributions, issue logging, and platform feature requests are deeply welcomed. Feel free to check the issues page or submit pull requests targeted to the primary development branch.

## License Guidelines

This application architecture is entirely open-source and officially available under the [MIT License](LICENSE).
