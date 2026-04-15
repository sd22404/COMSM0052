import { TutorialPhase, TutorialProgress, TutorialStatus } from "@/common/types";

export const TUTORIAL_STATUS_KEY = "music-machine:tutorial";

function isTutorialPhase(value: unknown): value is TutorialPhase {
	return value === "tour" || value === "lessons";
}

function clampIndex(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0
		? Math.floor(value)
		: 0;
}

export function createDefaultTutorialProgress(): TutorialProgress {
	return {
		phase: "tour",
		tourStep: 0,
		lessonIndex: 0,
	};
}

export function createDefaultTutorialStatus(): TutorialStatus {
	return {
		completed: false,
		skipped: false,
		progress: createDefaultTutorialProgress(),
	};
}

export function normaliseTutorialStatus(value: unknown): TutorialStatus {
	if (!value || typeof value !== "object")
		return createDefaultTutorialStatus();

	const record = value as Record<string, unknown>;
	const progressRecord =
		record.progress && typeof record.progress === "object"
			? record.progress as Record<string, unknown>
			: {};

	return {
		completed: record.completed === true,
		skipped: record.skipped === true,
		progress: {
			phase: isTutorialPhase(progressRecord.phase) ? progressRecord.phase : "tour",
			tourStep: clampIndex(progressRecord.tourStep),
			lessonIndex: clampIndex(progressRecord.lessonIndex),
		},
	};
}

export function readTutorialStatus(rawValue: string | null): TutorialStatus {
	if (!rawValue) return createDefaultTutorialStatus();

	try {
		return normaliseTutorialStatus(JSON.parse(rawValue));
	} catch {
		return createDefaultTutorialStatus();
	}
}
