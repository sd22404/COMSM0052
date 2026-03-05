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

let DEFAULT_MEMORY = new Array(256).fill("");
DEFAULT_MEMORY[0] = "C4";
DEFAULT_MEMORY[1] = "D4";
DEFAULT_MEMORY[2] = "Eb4";
DEFAULT_MEMORY[3] = "F4";

export class Sequencer {
	private _audio: AudioEngine;
	private _registers: Record<Register, number> = { ...DEFAULT_REGISTERS };
	private _memory: (number | string)[] = [...DEFAULT_MEMORY];
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
		this._tracks = tracks.map(t => {
			const old = this._tracks.find(o => o.name === t.name);
			if (!old) return t;
			t.cursor = Math.min(old.cursor, t.program.instructions.length - 1);
			t.waitRemaining = old.waitRemaining;
			return t;
		});

		this._notify();
	}

	setMemory(addr: number, val: number | string) {
		this._memory[addr] = val;
		this._notify();
	}

	setRegister(reg: Register, val: number) {
		this._applyRegister(reg, val);
		this._notify();
	}

	private _applyRegister(reg: Register, val: number) {
		if (!(reg in this._registers)) return;
		if (this._registers[reg] === val) return;
		this._registers[reg] = val;
		if (reg === Register.BPM) {
			this._audio.bpm = val;
			if (this._running) this._restartInterval();
		}
		if (reg === Register.VOL) this._audio.volume = val;
	}

	private _notify() {
		this._onStateChange?.(this.state);
	}

	private _resolveValue(operand: string | number): number {
		return this._registers[operand as Register] ?? Number(operand);
	}

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
					this._notify();
					this._advanceCursor(track);
					return;
				case Opcode.REST:
					track.waitRemaining += (operandOne as number) - 1;
					this._notify();
					this._advanceCursor(track);
					return;
				case Opcode.JUMP:
					track.cursor = track.program.labels[operandOne as string] ?? track.cursor;
					continue;
				case Opcode.BRZ:
					if (this._resolveValue(operandOne as string) === 0) {
						track.cursor = track.program.labels[operandTwo as string] ?? track.cursor;
						continue;
					}
					break;
				case Opcode.SET:
					this._applyRegister(operandOne as Register, this._resolveValue(operandTwo as string));
					break;
				case Opcode.LOAD: {
					const val = parseInt(this._memory[this._resolveValue(operandTwo as string)] as string);
					if (!isNaN(val)) this._applyRegister(operandOne as Register, val);
					break;
				}
				case Opcode.ADD:
					this._applyRegister(operandOne as Register, this._registers[operandOne as Register] + this._resolveValue(operandTwo as string));
					break;
			}

			this._advanceCursor(track);
		}
	}

	private _resetTracks() {
		this._tracks.forEach(t => {
			t.cursor = 0;
			t.waitRemaining = 0;
		});
	}

	private _restartInterval() {
		clearInterval(this._interval);
		this._interval = setInterval(() => this._tracks.forEach(t => this._stepTrack(t)), this._audio.clickMs);
	}

	run() {
		if (this._running) return;
		this._audio.init();
		this._running = true;
		this._restartInterval();
		this._notify();
	}

	halt() {
		this._running = false;
		clearInterval(this._interval);
		this._resetTracks();
		this._notify();
	}
}
