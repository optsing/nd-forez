# ND Forez

## 🚀 Live Preview

👉 [View on GitHub Pages](https://optsing.github.io/nd-forez/)

## Requirements

Make sure the following are installed on your machine:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Python 3.13](https://www.python.org/)
- [uv](https://github.com/astral-sh/uv)

## Getting Started

### Client

1. Navigate to the `client` directory:

   ```bash
   cd client
   ```

2. Install Node dependencies using `pnpm`:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

   The client should now be running at `http://localhost:5173`.

### Server

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

2. Install Python dependencies using `uv`:

   ```bash
   uv sync
   ```

3. Run the FastAPI development server:

   ```bash
   uv run fastapi dev ./src/main.py
   ```

   The API docs will be available at `http://localhost:8000/api/docs`

## Docker

To build and run the entire project using Docker:

1. Build the Docker image:

   ```bash
   docker build -t nd-forez .
   ```

2. Run the container:

   ```bash
   docker run -p 8000:80 nd-forez
   ```
