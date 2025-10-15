import threading
import webview
import uvicorn
from main import app
from window_state import WindowState, rect_from_window, load_window_state, save_window_state

PORT: int = 48123


def run_server() -> None:
    uvicorn.run(app, host='127.0.0.1', port=PORT)


def main() -> None:
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    last_state = load_window_state()
    window = webview.create_window(
        "ND Forez",
        f"http://127.0.0.1:{PORT}",
        x=last_state.x,
        y=last_state.y,
        width=last_state.width,
        height=last_state.height,
        maximized=last_state.maximized,
    )

    if window:
        last_restored = {
            'x': last_state.x,
            'y': last_state.y,
            'width': last_state.width,
            'height': last_state.height,
        }
        maximized = last_state.maximized
        final_window = window

        def on_maximized() -> None:
            nonlocal maximized
            maximized = True

        def on_restored() -> None:
            nonlocal last_restored, maximized
            last_restored = rect_from_window(final_window)
            maximized = False

        def on_window_closing():
            nonlocal last_restored
            if not maximized:
                last_restored = rect_from_window(final_window)
            save_window_state(WindowState(
                x=last_restored['x'],
                y=last_restored['y'],
                width=last_restored['width'],
                height=last_restored['height'],
                maximized=maximized,
            ))

        window.events.maximized += on_maximized
        window.events.restored += on_restored
        window.events.closing += on_window_closing

        webview.start()


if __name__ == "__main__":
    main()
