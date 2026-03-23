import { VM } from "./vm";
import { AudioEngine } from "@/audio/engine";
import { Register, NoteEvent, Track } from "@/core/types";

export interface SequencerState {
	running: boolean;
	highlights: { line: number, time: number }[];
	registers: Record<Register, number>;
	memory: number[];
}

export class Sequencer {
	LOOK_AHEAD = 100;
	SCHEDULE_AHEAD = 0.5;

	constructor(public vm: VM = new VM(), private audio: AudioEngine = new AudioEngine()) {
		this.vm.broadcast = () => this.notify();
	}
	
	running: boolean = false;
	highlights: { line: number, time: number }[] = [];
	private interval!: NodeJS.Timeout;
	private startTime = 0;
	private listeners = new Set<(state: SequencerState) => void>();

	get state(): SequencerState {
		return {
			running: this.running,
			highlights: [ ...this.highlights ],
			registers: { ...this.vm.state.registers },
			memory: [ ...this.vm.state.memory ],
		};
	}

	subscribe(listener: (state: SequencerState) => void): () => void {
		this.listeners.add(listener);
		listener(this.state);

		return () => {
			this.listeners.delete(listener);
		};
	}

	setTracks(tracks: Track[]) {
		this.vm.setTracks(tracks);
		this.notify();
	}

	setRegister(reg: Register, val: number) {
		this.vm.setRegister(reg, val);
		if (reg === Register.VOL) {
			this.audio.volume = val;
		}
		if (reg === Register.BPM) {
			this.audio.bpm = val;
		}
	}

	setAddress(addr: number, val: number) {
		this.vm.setAddress(addr, val);
	}

	private notify() {
		const state = this.state;
		for (const listener of this.listeners) {
			listener(state);
		}
	}

	run() {
		if (this.running) return;
		this.audio.init();
		this.audio.volume = this.vm.getRegister(Register.VOL);
		this.audio.bpm = this.vm.getRegister(Register.BPM);
		this.vm.resetTracks();
		this.highlights = [];
		this.startTime = this.audio.currentTime();
		this.running = true;
		clearInterval(this.interval);
		this.interval = setInterval(() => this.schedule(), this.LOOK_AHEAD);
		this.notify();
	}

	halt() {
		if (!this.running) return;
		this.running = false;
		clearInterval(this.interval);
		this.audio.stopAll();
		this.notify();
	}

	private schedule() {
		const now = this.audio.currentTime() - this.startTime;
		const events = this.vm.seek(now + this.SCHEDULE_AHEAD);
		let played = false;

		while (events.length > 0) {
			played = true;
			this.handleEvent(events.pop()!);
		}

		if (played) this.notify();
	}

	private handleEvent(event: NoteEvent) {
		this.audio.play(event.instrument, event.pitch, event.duration, this.startTime + event.time);
		this.highlights.push({ line: event.line, time: event.time });
	}
}
