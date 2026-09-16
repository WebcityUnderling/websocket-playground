export interface CursorState {
  targetX: number;
  targetY: number;
  idle: boolean;
  entered: boolean;
  dt: number;
  stopRequests: number;
}

type CursorSubscriber = (state: CursorState & { ts: number }) => void;

export function createCursorEngine({
  idleDelay = 20, // ms of no movement
} = {}) {
  const subs = new Set<CursorSubscriber>();
  let frame: number | undefined;
  let running = false;
  let inside = false;
  let lastTs = 0;
  let lastMoveTs = 0;

  const state: CursorState = {
    targetX: 0,
    targetY: 0,
    idle: true,
    entered: false,
    dt: 0,
    stopRequests: 0,
  };

  const emit = (ts: number) => {
    for (const fn of subs) fn({ ...state, ts });
  };

  function start() {
    if (!running) {
      running = document.hasFocus();
      lastTs = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function stop() {
    running = false;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  function tick(ts: number) {
    if (!running) return;

    if (state.idle && subs.size <= state.stopRequests) {
      state.stopRequests = 0;
      stop();
      return;
    }

    state.stopRequests = 0;
    state.dt = Math.max(0, ts - lastTs); // ms
    lastTs = ts;

    // Idle detection
    state.idle = ts - lastMoveTs > idleDelay;

    emit(ts);

    frame = requestAnimationFrame(tick);
  }

  function requestStop() {
    state.stopRequests = state.stopRequests + 1;
  }

  function onMouseMove(e: MouseEvent) {
    if (subs.size > 0) {
      state.targetX = e.clientX;
      state.targetY = e.clientY;
      state.idle = false;
      state.stopRequests = 0;
      lastMoveTs = performance.now();
      start();
    }
  }

  function onVis() {
    if (document.hidden) stop();
  }

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  // Public API
  function subscribe(fn: CursorSubscriber) {
    subs.add(fn);
    if (subs.size === 1 && inside) start();
    // Immediately push current state so components can render on mount
    fn({ ...state, ts: performance.now() });
    return () => {
      subs.delete(fn);
      if (subs.size === 0) stop();
    };
  }

  function destroy() {
    stop();
    subs.clear();
    window.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("visibilitychange", onVis);
  }

  return { subscribe, destroy, state, requestStop };
}
