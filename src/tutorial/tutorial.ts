import { TutorialState } from "@/common/types";
import { LESSONS } from "./lessons";

export function createDefaultTutorial(): TutorialState {
	return {
		active: true,
		step: 0,
		lesson: LESSONS[0],
	};
}

export class Tutorial {
	private step: number = 0;
	private broadcast?: (state: TutorialState) => void;

	get state(): TutorialState {
		return {
			active: this.step < LESSONS.length,
			step: this.step,
			lesson: this.lesson,
		};
	}

	get lesson() {
		return LESSONS[this.step];
	}

	setBroadcast(fn: (state: TutorialState) => void) {
		this.broadcast = fn;
		this.notify();
	}

	next() {
		this.step++;
		this.notify();
	}

	reset() {
		this.step = 0;
		this.notify();
	}

	private notify() {
		this.broadcast?.(this.state);
	}
}
