import { TutorialProgress, TutorialStatus } from "@/common/types";

export const TUTORIAL_STATUS_KEY = "music-machine:tutorial:inline";

function clampIndex(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0
		? Math.floor(value)
		: 0;
}

export function createDefaultTutorialProgress(): TutorialProgress {
	return {
		lessonIndex: 0,
		lessonStep: 0,
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
	if (!record.progress || typeof record.progress !== "object")
		return createDefaultTutorialStatus();

	const progressRecord = record.progress as Record<string, unknown>;
	const progressKeys = Object.keys(progressRecord);
	if (progressKeys.some((key) => key !== "lessonIndex" && key !== "lessonStep"))
		return createDefaultTutorialStatus();

	return {
		completed: record.completed === true,
		skipped: record.skipped === true,
		progress: {
			lessonIndex: clampIndex(progressRecord.lessonIndex),
			lessonStep: clampIndex(progressRecord.lessonStep),
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
