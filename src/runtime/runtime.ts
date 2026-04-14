import { CompileResult, Note, Parameter, PlayWindow, Register, RuntimeState } from "@/common/types";
import { AudioEngine, DEFAULT_SAMPLE_MAP } from "@/audio/engine";
import { Compiler } from "@/language/compiler";
import { CPU, createDefaultCPU } from "@/machine/cpu";
import { Transport, createDefaultTransport } from "./transport";
import { Highlights, createDefaultHighlights, EXECUTION_HIGHLIGHT_TIME } from "./highlights";

const SCHEDULE_INTERVAL = 12; // ms
const LOOKAHEAD_SECONDS = 0.2;

export function createDefaultRuntime() {
	return {
		running: false,
		cpu: createDefaultCPU(),
		transport: createDefaultTransport(),
		highlights: createDefaultHighlights(),
		samples: new Map<number, string>(
			Array.from(DEFAULT_SAMPLE_MAP.entries()).map(([note, sample]) => [note, sample.path]),
		),
	};
}

export class Runtime {
	constructor() {
		this.cpu = new CPU();
		this.transport = new Transport();
		this.audio = new AudioEngine();
		this.highlights = new Highlights();
	}

	private running = false;
	private starting = false;
	private readonly cpu: CPU;
	private readonly transport: Transport;
	private readonly audio: AudioEngine;
	private readonly highlights: Highlights;
	private broadcast?: (state: RuntimeState) => void;
	private interval?: NodeJS.Timeout;

	get state(): RuntimeState {
		return {
			running: this.running,
			cpu: this.cpu.state,
			transport: this.transport.state,
			highlights: this.highlights.state,
			samples: this.audio.samples,
		};
	}

	setBroadcast(fn: (state: RuntimeState) => void) {
		this.broadcast = fn;
		this.notify();
	}

	private notify() {
		this.broadcast?.(this.state);
	}

	private tick() {
		const targetBeat = this.transport.lookahead(this.audio.time, LOOKAHEAD_SECONDS);
		if (!targetBeat) return;

		const events = this.cpu.execUntil(targetBeat);

		for (const event of events) {
			const window = this.scheduleNote(event.beat, event.note);
			if (!window) continue;

			this.highlights.push({
				coreID: event.coreID,
				window,
				span: event.span,
				regs: event.log.registers,
				memory: event.log.memory,
			})
		}

		this.highlights.refresh(this.audio.time);
		this.notify();
	}

	private scheduleNote(beat: number, note?: Note): PlayWindow | undefined {
		const when = this.transport.timeAtBeat(beat);
		if (!note) return {start: when, end: when + EXECUTION_HIGHLIGHT_TIME};
		const duration = this.transport.makeDuration(beat, beat + note.length);
		return this.audio.schedule(note, when, duration);
	}

	private async init() {
		try {
			await this.audio.ready();
		} catch (error) {
			console.error("Failed to initialise audio playback:", error);
			this.starting = false;
			return;
		}

		if (this.running || !this.starting) return;
		this.starting = false;
		this.running = true;

		this.audio.setMasterVolume(this.cpu.state.parameters[Parameter.VOL]);
		this.transport.start(this.audio.time);
		this.tick();
		this.notify();
		this.interval = setInterval(() => this.tick(), SCHEDULE_INTERVAL);
	}

	run() {
		if (this.running || this.starting) return;
		this.starting = true;
		void this.init();
	}

	halt() {
		if (!(this.starting || this.running || this.interval)) return;

		this.running = false;
		this.starting = false;

		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}

		this.transport.halt(this.audio.time);
		this.audio.panic();
		this.highlights.clear();
		this.notify();
	}

	reset() {
		this.halt();
		this.cpu.reset();
		this.transport.reset();
		this.audio.reset();
		this.highlights.clear();
		this.notify();
	}

	load(coreID = 0, code: string): CompileResult {
		const result = Compiler.compile(code);
		if (!result.program) {
			this.notify();
			return result;
		}

		this.cpu.load(coreID, result.program);
		this.highlights.clearCore(coreID, this.audio.time);
		this.notify();
		return result;
	}

	setAddress(addr: number, value: number) {
		this.cpu.setAddress(addr, value);
		this.notify();
	}

	setRegister(coreID: number, register: Register, value: number) {
		this.cpu.setRegister(coreID, register, value);
		this.notify();
	}

	setParameter(param: Parameter, value: number) {
		this.cpu.setParameter(param, value);
		if (param === Parameter.BPM) this.transport.setBPM(value, this.audio.time);
		if (param === Parameter.VOL) this.audio.setMasterVolume(value);
		this.notify();
	}

	setSample(note: number, sample: string) {
		void this.audio.setSample(note, sample).finally(() => this.notify());
	}

	setEnabled(coreID: number, enabled: boolean) {
		this.cpu.setEnabled(coreID, enabled);
		this.notify();
	}
}
