# TaskFlow 🚀

A collaborative, real-time project management tool inspired by Jira and Trello. Built with the MERN/PERN stack, it provides a seamless experience for teams to manage workspaces, projects, and tasks on a Kanban-style board.

---

## ✨ Features

-   **Authentication & User Roles**: Secure sign-up and login with JWT. Role-based access control (**Admin** and **Member**).
-   **Workspace Management**: Users can create and manage their own workspaces, similar to organizations in other tools.
-   **Project Organization**: Create multiple projects within each workspace to keep your work segmented.
-   **CRUD for Tasks**: Full create, read, update, and delete functionality for tasks.
-   **Interactive Kanban Board**: A drag-and-drop interface to move tasks between statuses (**To Do**, **In Progress**, **Done**).
-   **Real-Time Collaboration**: Live updates across all connected clients using **Socket.IO**. When one user moves a task, everyone sees it instantly.
-   **Task Commenting**: Discuss task details with your team right where the work is happening.
-   **Notifications**: Get notified when you're assigned a task or when there's a new comment.
-   **Productivity Tools**: Assign **due dates** and **priorities** (Low, Medium, High) to tasks.
-   **Labels & Tagging**: Categorize tasks with labels like `Bug`, `Frontend`, or `Backend` for easy filtering.

---

## 🛠️ Tech Stack

| Category      | Technology                                                                          |
| ------------- | ----------------------------------------------------------------------------------- |
| **Frontend** | [**Next.js**](https://nextjs.org/) (React Framework)                                |
| **Backend** | [**Express.js**](https://expressjs.com/) (Node.js Framework)                        |
| **Database** | [**PostgreSQL**](https://www.postgresql.org/) (with [**Prisma**](https://prisma.io/)) |
| **Real-Time** | [**Socket.IO**](https://socket.io/)                                                 |
| **Auth** | **JWT** (JSON Web Tokens)                                                           |
| **Styling** | **Tailwind CSS** or **MUI** (Your Choice)                                           |
| **File Uploads**| **Cloudinary** / **AWS S3** |
| **Analytics** | **Recharts** / **Chart.js** |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later)
-   npm, pnpm, or yarn
-   PostgreSQL instance

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install backend dependencies:**
    ```sh
    cd server
    npm install
    ```

3.  **Install frontend dependencies:**
    ```sh
    cd ../client
    npm install
    ```

4.  **Set up environment variables:**
    -   In the `server` directory, create a `.env` file and add the following variables. See `.env.example` for a template.
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    JWT_SECRET="your_super_secret_key"
    ```

5.  **Run database migrations:**
    -   From the `server` directory, apply the Prisma schema to your database.
    ```sh
    npx prisma migrate dev
    ```

6.  **Start the servers:**
    -   **Backend:** In the `server` directory, run:
        ```sh
        npm run dev
        ```
    -   **Frontend:** In the `client` directory, run:
        ```sh
        npm run dev
        ```

The application should now be running at `http://localhost:3000`.

---

## 🗺️ Project Roadmap

Here is the planned development roadmap, broken down into phases.

### ✅ Phase 1: Core (MVP)
- [x] User authentication (Sign up, login, logout)
- [x] User roles (Admin, Member)
- [x] Workspace creation
- [x] Project creation within workspaces
- [x] Basic task CRUD (Create, Update, Delete)
- [x] Task assignment
- [x] Task statuses (To Do, In Progress, Done)
- [x] Frontend Kanban board with drag-and-drop functionality

### 🟡 Phase 2: Collaboration Features
- [ ] Commenting system on tasks with author and timestamp
- [ ] Real-time updates via WebSockets for task movements and comments
- [ ] In-app notification system (e.g., "You were assigned a task")

### 🟡 Phase 3: Productivity Tools
- [ ] Due dates and priority fields for tasks
- [ ] Color-coding on the Kanban board based on priority/due date
- [ ] Labels/Tags for task categorization
- [ ] Filtering tasks by label
- [ ] Task activity log ("User X moved task Y...")

### ⚫ Phase 4: Advanced Features
- [ ] Invite members to a workspace via email
- [ ] Enhanced role-based permissions (Admins manage workspaces, Members manage tasks)
- [ ] Analytics dashboard with charts for productivity metrics
- [ ] File attachments on tasks
- [ ] Global search and advanced filtering

### ⚫ Phase 5: Pro-Level Features
- [ ] Integrations with third-party apps (Slack, GitHub)
- [ ] Subtasks and checklists within a parent task
- [ ] AI-powered suggestions (e.g., auto-labeling, overdue task alerts)

---