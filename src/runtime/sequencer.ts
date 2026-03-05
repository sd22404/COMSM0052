import { Track, Opcode, Instrument, Register } from "@/core/types";
import { AudioEngine } from "@/audio/engine";

export interface SequencerState {
	registers: Record<Register, number>;
	memory: (number | string)[];
	running: boolean;
	cursors: number[];
}

const DEFAULT_REGISTERS: Record<Register, number> = {
	[Register.BPM]: 120,
	[Register.VOL]: 100,
	[Register.REG1]: 0,
	[Register.REG2]: 0,
};

export class Sequencer {
	private _audio: AudioEngine;
	private _registers: Record<Register, number> = { ...DEFAULT_REGISTERS };
	private _memory: (number | string)[] = new Array(256).fill("");
	private _tracks: Track[] = [];
	private _running = false;
	private _interval?: NodeJS.Timeout;
	private _onStateChange?: (state: SequencerState) => void;

	constructor(audio: AudioEngine) {
		this._audio = audio;
	}

	set onStateChange(fn: (state: SequencerState) => void) {
		this._onStateChange = fn;
	}

	get state(): SequencerState {
		return {
			registers: { ...this._registers },
			memory: [...this._memory],
			running: this._running,
			cursors: this._tracks.map(t => t.program.instructions[t.cursor].line),
		};
	}

	setTracks(tracks: Track[]) {
		this._tracks = tracks;
		this._notify();
	}

	setMemory(addr: number, val: number | string) {
		this._memory[addr] = val;
		this._notify();
	}

	setRegister(reg: Register, val: number) {
		if (!(reg in this._registers)) return;
		this._registers[reg] = val;
		if (reg === Register.BPM) this._audio.bpm = val;
		if (reg === Register.VOL) this._audio.volume = val;
		this._notify();
	}

	private _notify() {
		this._onStateChange?.(this.state);
	}

	private _resolveValue(operand: string | number): number {
		return this._registers[operand as Register] ?? Number(operand);
	}

	// to be sorted
	private _resolveNote(operand: string): string {
		const asInt = parseInt(operand);
		if (!isNaN(asInt)) return this._memory[asInt] as string;
		if (operand in this._registers) return this._memory[this._registers[operand as Register]] as string;
		return operand;
	}

	private _advanceCursor(track: Track) {
		track.cursor++;
		track.cursor %= track.program.instructions.length;
	}

	private _stepTrack(track: Track) {
		if (!this._running) return;
		if (track.waitRemaining > 0) { track.waitRemaining--; return; }

		let safety = 0;
		while (safety++ < 1000) {
			const instr = track.program.instructions[track.cursor];
			const [operandOne, operandTwo] = instr.operands;

			switch (instr.opcode) {
				case Opcode.PLAY:
					this._audio.play(operandOne as Instrument, this._resolveNote(operandTwo as string));
					this._advanceCursor(track);
					this._notify();
					return;
				case Opcode.REST:
					track.waitRemaining += (operandOne as number) - 1;
					this._advanceCursor(track);
					this._notify();
					return;
				case Opcode.JUMP:
					track.cursor = track.program.labels[operandOne as string] ?? track.cursor;
					continue;
				case Opcode.SET:
					this.setRegister(operandOne as Register, this._resolveValue(operandTwo as string));
					break;
				case Opcode.LOAD: {
					const val = parseInt(this._memory[this._resolveValue(operandTwo as string)] as string);
					if (!isNaN(val)) this.setRegister(operandOne as Register, val);
					break;
				}
				case Opcode.ADD:
					this.setRegister(operandOne as Register, this._registers[operandOne as Register] + this._resolveValue(operandTwo as string));
					break;
			}

			this._advanceCursor(track);
		}

		this._notify();
	}

	run() {
		this._audio.init();
		this._running = true;
		this._interval = setInterval(() => this._tracks.forEach(t => this._stepTrack(t)), this._audio.clickMs);
		this._notify();
	}

	halt() {
		this._running = false;
		clearInterval(this._interval);
		this._notify();
	}
}
