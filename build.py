#!/usr/bin/env python3
import platform
import shutil
import subprocess
import sys
from pathlib import Path


def run(cmd, cwd=None):
    """Run a shell command and exit on failure."""
    print(f"\n> {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        print(f"❌ Command failed: {' '.join(cmd)}")
        sys.exit(result.returncode)


def safe_rmdir(path: Path):
    if path.exists():
        shutil.rmtree(path)


def safe_mkdir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def copytree(src: Path, dst: Path):
    shutil.copytree(src, dst, dirs_exist_ok=True)


def main():
    root = Path(__file__).resolve().parent
    server_dir = root / "server"
    client_dir = root / "client"
    release_dir = root / "releases" / platform.system()

    print("🚀 Building the project...")

    # === Build server ===
    print("\n📦 Building server...")
    run(["uv", "sync", "--locked"], cwd=server_dir)
    run([
        "uv", "run", "pyinstaller",
        "--noconfirm", "--noconsole",
        "--specpath", "build_specs",
        "--name", "nd-forez-app",
        "--icon", str(server_dir / "assets" / "icon.ico"),
        "src/run.py"
    ], cwd=server_dir)

    # === Build client ===
    print("\n🧱 Building client...")
    run(["pnpm", "install", "--frozen-lockfile"], cwd=client_dir)
    run(["pnpm", "build:app"], cwd=client_dir)

    # === Prepare release directory ===
    print(f"\n📂 Preparing release directory: {release_dir}")
    safe_rmdir(release_dir)
    safe_mkdir(release_dir / "public")
    safe_mkdir(release_dir / "database")

    # === Copy server build ===
    copytree(server_dir / "dist" / "nd-forez-app", release_dir)

    # === Copy client build ===
    copytree(client_dir / "dist", release_dir / "public")

    print(f"\n✅ Build complete! Check '{release_dir}' for the executable and assets.")


if __name__ == "__main__":
    main()
