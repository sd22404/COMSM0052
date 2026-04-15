import { TutorialStatus } from "@/common/types";
import {
	createDefaultTutorialStatus,
	readTutorialStatus,
	TUTORIAL_STATUS_KEY,
} from "@/tutorial/tutorial";
import { useCallback, useSyncExternalStore } from "react";

type TutorialStatusUpdate =
	| TutorialStatus
	| ((current: TutorialStatus) => TutorialStatus);

function createCodeKey(scope: string, coreID: number) {
	return `music-machine:code:${scope}:${coreID}`;
}

let readySnapshot = false;
let readyQueued = false;
const readyListeners = new Set<() => void>();

let tutorialStatusSnapshot = createDefaultTutorialStatus();
let tutorialStatusRaw: string | null = null;
let tutorialStatusInitialised = false;
const tutorialStatusListeners = new Set<() => void>();

function emitReadyChange() {
	for (const listener of readyListeners)
		listener();
}

function emitTutorialStatusChange() {
	for (const listener of tutorialStatusListeners)
		listener();
}

function cacheTutorialStatus(rawValue: string | null) {
	tutorialStatusRaw = rawValue;
	tutorialStatusSnapshot = readTutorialStatus(rawValue);
	tutorialStatusInitialised = true;
	return tutorialStatusSnapshot;
}

function getTutorialStatusSnapshot() {
	if (typeof window === "undefined")
		return tutorialStatusSnapshot;

	const rawValue = localStorage.getItem(TUTORIAL_STATUS_KEY);
	if (!tutorialStatusInitialised || rawValue !== tutorialStatusRaw)
		return cacheTutorialStatus(rawValue);

	return tutorialStatusSnapshot;
}

function getServerTutorialStatusSnapshot() {
	return tutorialStatusSnapshot;
}

function getReadySnapshot() {
	return readySnapshot;
}

function getServerReadySnapshot() {
	return false;
}

function queueReadySnapshot() {
	if (typeof window === "undefined" || readySnapshot || readyQueued)
		return;

	readyQueued = true;
	window.setTimeout(() => {
		readyQueued = false;
		if (readySnapshot) return;
		readySnapshot = true;
		emitReadyChange();
	}, 0);
}

function subscribeReady(listener: () => void) {
	readyListeners.add(listener);
	queueReadySnapshot();

	return () => {
		readyListeners.delete(listener);
	};
}

function subscribeTutorialStatus(listener: () => void) {
	tutorialStatusListeners.add(listener);

	if (typeof window === "undefined") {
		return () => {
			tutorialStatusListeners.delete(listener);
		};
	}

	function onStorage(event: StorageEvent) {
		if (event.key !== TUTORIAL_STATUS_KEY)
			return;

		cacheTutorialStatus(event.newValue);
		listener();
	}

	window.addEventListener("storage", onStorage);

	return () => {
		tutorialStatusListeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

function writeTutorialStatus(status: TutorialStatus) {
	if (typeof window === "undefined")
		return status;

	const rawValue = JSON.stringify(status);
	localStorage.setItem(TUTORIAL_STATUS_KEY, rawValue);
	cacheTutorialStatus(rawValue);
	emitTutorialStatusChange();
	return tutorialStatusSnapshot;
}

interface StorageHook {
	ready: boolean;
	storeCode: (scope: string, coreID: number, code: string) => void;
	retrieveCode: (scope: string, coreID: number, fallback: string) => string;
	clearCodeScope: (scope: string) => void;
	clearCodeScopes: (scopePrefix: string) => void;
	tutorialStatus: TutorialStatus;
	setTutorialStatus: (update: TutorialStatusUpdate) => void;
	resetTutorialStatus: () => void;
	shouldRedirectToTutorial: boolean;
}

export default function useStorage(): StorageHook {
	const ready = useSyncExternalStore(
		subscribeReady,
		getReadySnapshot,
		getServerReadySnapshot,
	);
	const tutorialStatus = useSyncExternalStore(
		subscribeTutorialStatus,
		getTutorialStatusSnapshot,
		getServerTutorialStatusSnapshot,
	);

	const storeCode = useCallback((scope: string, coreID: number, code: string) => {
		if (typeof window === "undefined") return;
		localStorage.setItem(createCodeKey(scope, coreID), code);
	}, []);

	const retrieveCode = useCallback((scope: string, coreID: number, fallback: string): string => {
		if (typeof window === "undefined") return fallback;
		const value = localStorage.getItem(createCodeKey(scope, coreID));
		return value ?? fallback;
	}, []);

	const clearCodeScope = useCallback((scope: string) => {
		if (typeof window === "undefined") return;
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(`music-machine:code:${scope}:`))
				localStorage.removeItem(key);
		}
	}, []);

	const clearCodeScopes = useCallback((scopePrefix: string) => {
		if (typeof window === "undefined") return;
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(`music-machine:code:${scopePrefix}`))
				localStorage.removeItem(key);
		}
	}, []);

	const setTutorialStatus = useCallback((update: TutorialStatusUpdate) => {
		const current = getTutorialStatusSnapshot();
		const next = typeof update === "function" ? update(current) : update;
		writeTutorialStatus(next);
	}, []);

	const resetTutorialStatus = useCallback(() => {
		setTutorialStatus(createDefaultTutorialStatus());
	}, [setTutorialStatus]);

	return {
		ready,
		storeCode,
		retrieveCode,
		clearCodeScope,
		clearCodeScopes,
		tutorialStatus,
		setTutorialStatus,
		resetTutorialStatus,
		shouldRedirectToTutorial: ready && !tutorialStatus.completed && !tutorialStatus.skipped,
	};
}
