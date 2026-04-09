import { CodeSpan, HighlightState, MemoryAccess, PlayWindow, RegisterAccess } from "@/common/types";

export const EXECUTION_HIGHLIGHT_TIME = 0.2;

export function createDefaultHighlights(): HighlightState {
	return {
		code: [],
		regs: [],
		memory: [],
	};
}

interface HighlightCue {
	coreID: number;
	window: PlayWindow;
	span: CodeSpan;
	regs: RegisterAccess[];
	memory: MemoryAccess[];
}

export class Highlights {
	private cues: HighlightCue[] = [];
	private activeCues: HighlightCue[] = [];

	get state(): HighlightState {
		return this.buildState(this.activeCues);
	}

	private buildState(cues: HighlightCue[]): HighlightState {
		const state = createDefaultHighlights();
		for (const cue of cues) {
			const code = state.code[cue.coreID]
				?? (state.code[cue.coreID] = []);
			const regs = state.regs[cue.coreID]
				?? (state.regs[cue.coreID] = []);

			code.push(cue.span);
			regs.push(...cue.regs);
			state.memory.push(...cue.memory);
		}

		for (const code of state.code)
			code && code.sort((left, right) => left.from - right.from || left.to - right.to);

		return state;
	}

	push(cue: HighlightCue) {
		this.cues.push(cue);
	}

	refresh(now: number) {
		const queued: HighlightCue[] = [];
		const active: HighlightCue[] = [];

		for (const cue of this.cues) {
			if (cue.window.end <= now) continue;
			queued.push(cue);
			if (cue.window.start <= now) active.push(cue);
		}

		this.cues = queued;
		this.activeCues = active;
	}

	clear() {
		this.cues = [];
		this.activeCues = [];
	}

	clearCore(coreID: number, now: number) {
		this.cues = this.cues.filter(cue => cue.coreID !== coreID);
		this.refresh(now);
	}
}
