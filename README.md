# ND Forez


## 🚀 Live Preview

👉 [View on GitHub Pages](https://optsing.github.io/nd-forez/)


## 🧰 Requirements

Make sure the following are installed on your machine:

- [Git](https://git-scm.com/downloads) – for cloning the repository.
- [Node.js](https://nodejs.org/) – for running the frontend.
- [pnpm](https://pnpm.io/) – a fast alternative to npm.
- [Python 3.13](https://www.python.org/) – for the backend.
- [uv](https://github.com/astral-sh/uv) – a Python package/dependency manager.
- [Docker](https://docs.docker.com/get-docker/) – for containerized build (optional).


## 📦 Getting Started

### Clone the Repository

If you haven't already, clone the project using Git:

```bash
git clone https://github.com/optsing/nd-forez.git
cd nd-forez
```

---

### Run the client

Navigate to the `client` folder and install dependencies:

```bash
cd client
pnpm install
```

Start the Vite development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Run the API server

Navigate to the `server` folder and install Python dependencies:

```bash
cd server
uv sync
```

Start the FastAPI server:

```bash
uv run fastapi dev ./src/main.py
```

The API documentation will be available at: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## 🐳 Docker

### Build and run the entire project using Docker

Build the Docker image:

```bash
docker build -t nd-forez .
```

Run the container:

```bash
docker run -p 8000:80 nd-forez
```


## 📄 License

This project is licensed under the [MIT License](LICENSE).
