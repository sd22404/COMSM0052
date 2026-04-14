import { TutorialState } from "@/common/types";

export function createDefaultTutorial(): TutorialState {
	return {
		active: true,
		title: TITLES[0],
		text: STEPS[0],
		anchorRef: ANCHORS[0],
	};
}

enum TutorialStep {
	Welcome,
	Two,
	Three,
	Four,
	Finish
}

const TITLES = [
	"Welcome",
	"Step Two",
	"Step Three",
	"Step Four",
	"Finish"
]

const STEPS = [
	"Welcome!",
	"Step two.",
	"Step three.",
	"Step four.",
	"Finish!"
]

const ANCHORS = [
	"workspace",
	"cores",
	"cores",
	"controls",
	"workspace",
]

export class Tutorial {
	private _step: TutorialStep = TutorialStep.Welcome;
	private active: boolean = true;
	private broadcast?: (state: TutorialState) => void;

	get state() {
		return {
			active: this.active,
			title: TITLES[this._step],
			text: STEPS[this._step],
			anchorRef: ANCHORS[this._step],
		};
	}

	setBroadcast(fn: (state: TutorialState) => void) {
		this.broadcast = fn;
		this.notify();
	}

	next() {
		this._step++;
		if (this._step > TutorialStep.Finish) {
			this._step = TutorialStep.Finish;
			this.active = false;
		}
		this.notify();
	}

	reset() {
		this._step = TutorialStep.Welcome;
		this.active = true;
		this.notify();
	}

	private notify() {
		this.broadcast?.(this.state);
	}
}
