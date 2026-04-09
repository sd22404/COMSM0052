import { Note, Parameter, PlayWindow, Register, RuntimeState } from "@/common/types";
import { AudioEngine } from "@/audio/engine";
import { Assembler } from "@/language/assembler";
import { CPU, createDefaultCPU } from "@/machine/cpu";
import { Transport, createDefaultTransport } from "./transport";
import { Highlights, createDefaultHighlights, EXECUTION_HIGHLIGHT_TIME } from "./highlights";

const SCHEDULE_INTERVAL = 25; // ms
const LOOKAHEAD_SECONDS = 0.1;

export function createDefaultRuntime() {
	return {
		running: false,
		cpu: createDefaultCPU(),
		transport: createDefaultTransport(),
		highlights: createDefaultHighlights(),
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
		this.audio.panic();
		this.highlights.clear();
		this.notify();
	}

	load(coreID = 0, code: string) {
		const program = Assembler.assemble(code);
		this.cpu.load(coreID, program);
		this.highlights.clearCore(coreID, this.audio.time);
		this.notify();
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

	toggleCore(id: number) {
		this.cpu.toggleCore(id);
		this.notify();
	}
}
