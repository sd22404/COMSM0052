import { ExecutionTrace, HighlightState, NoteEvent, PlayWindow } from "@/common/types";

const EXECUTION_HIGHLIGHT_TIME = 0.2;

export function createDefaultHighlights(): HighlightState {
	return {
		cores: [],
		memory: [],
	};
}

interface HighlightCue {
	coreID: number;
	start: number;
	end: number;
	range: ExecutionTrace["instruction"]["range"];
	registers: ExecutionTrace["registers"];
	memory: ExecutionTrace["memory"];
}

interface CaptureContext {
	timeAtBeat: (beat: number) => number;
	scheduleEvent: (beat: number, note: NoteEvent) => PlayWindow | undefined;
}

export class Highlights {
	private cues: HighlightCue[] = [];
	private activeCues: HighlightCue[] = [];

	get state(): HighlightState {
		return this.buildState(this.activeCues);
	}
	
	private buildWindow(trace: ExecutionTrace, context: CaptureContext): PlayWindow | undefined {
		if (trace.event) return context.scheduleEvent(trace.beat, trace.event);

		const start = context.timeAtBeat(trace.beat);
		return { start, end: start + EXECUTION_HIGHLIGHT_TIME };
	}

	private buildState(cues: HighlightCue[]): HighlightState {
		const state = createDefaultHighlights();
		for (const cue of cues) {
			const core = state.cores[cue.coreID] ??
				(state.cores[cue.coreID] = { code: [], regs: []});

			core.code.push(cue.range);
			core.regs.push(...cue.registers);
			state.memory.push(...cue.memory);
		}

		for (const core of state.cores)
			core?.code.sort((left, right) => left.from - right.from || left.to - right.to);

		return state;
	}

	capture(traces: ExecutionTrace[], context: CaptureContext) {
		for (const trace of traces) {
			const window = this.buildWindow(trace, context);
			if (!window) continue;

			this.cues.push({
				coreID: trace.coreID,
				start: window.start,
				end: window.end,
				range: trace.instruction.range,
				registers: trace.registers,
				memory: trace.memory,
			});
		}
	}

	refresh(now: number) {
		const queued: HighlightCue[] = [];
		const active: HighlightCue[] = [];

		for (const cue of this.cues) {
			if (cue.end <= now) continue;
			queued.push(cue);
			if (cue.start <= now) active.push(cue);
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
