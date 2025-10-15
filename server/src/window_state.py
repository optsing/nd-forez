from pathlib import Path
from webview import Window
from pydantic import BaseModel
import ctypes


CONFIG_FILE = Path("window_state.json")


class WindowState(BaseModel):
    x: int | None = None
    y: int | None = None
    width: int = 1280
    height: int = 768
    maximized: bool = False


def get_windows_scaling() -> float:
    try:
        user32 = ctypes.windll.user32
        gdi32 = ctypes.windll.gdi32
        hdc = user32.GetDC(0)
        dpi = gdi32.GetDeviceCaps(hdc, 88)
        user32.ReleaseDC(0, hdc)
        return dpi / 96
    except Exception:
        return 1.0


def load_window_state() -> WindowState:
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                return WindowState.model_validate_json(f.read())
        except Exception:
            pass
    return WindowState()


def save_window_state(state: WindowState) -> None:
    with open(CONFIG_FILE, "w") as f:
        f.write(state.model_dump_json(indent=2))


def rect_from_window(window: Window):
    scale = get_windows_scaling()
    return {
        'x': int(window.x / scale),
        'y': int(window.y / scale),
        'width': int(window.width / scale),
        'height': int(window.height / scale),
    }
