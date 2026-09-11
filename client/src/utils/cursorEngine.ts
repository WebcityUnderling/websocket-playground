export function createCursorEngine({
	idleDelay = 20, // ms of no movement
} = {}) {
	let subs = new Set();
	let running = false;
	let inside = false;
	let lastTs = 0;
	let lastMoveTs = 0;

	const state = {
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
			requestAnimationFrame(tick);
		}
	}
	function stop() {
		running = false;
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

		requestAnimationFrame(tick);
	}

	function requestStop() {
		state.stopRequests = state.stopRequests + 1;
	}

	function onMouseMove(e: MouseEvent) {
		if (subs.size > 0) {
			state.targetX = e.clientX;
			state.targetY = e.clientY;
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
	function subscribe(fn: CallableFunction) {
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
