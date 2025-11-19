FROM python:3.13.9-alpine AS builder-server
WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
COPY ./server/pyproject.toml ./server/uv.lock ./

ENV UV_LINK_MODE=copy
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

RUN uv venv
RUN uv sync --locked --no-install-project --no-dev


FROM node:24.11.1-alpine AS builder-client
WORKDIR /app

COPY ./client .

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm install --frozen-lockfile
RUN pnpm build


FROM python:3.13.9-alpine
WORKDIR /app

COPY --from=builder-server /opt/venv /opt/venv
COPY --from=builder-client /app/dist/index.html ./public/
COPY --from=builder-client /app/dist/assets ./public/assets
COPY ./server/src .

EXPOSE 80
VOLUME [ "/app/database" ]

CMD ["/opt/venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
