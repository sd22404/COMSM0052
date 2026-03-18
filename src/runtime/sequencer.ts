import { Track, Opcode, Instrument, Register, Operand } from "@/core/types";
import { AudioEngine } from "@/audio/engine";

export interface SequencerState {
	registers: Record<Register, number>;
	memory: number[];
	running: boolean;
	cursors: number[];
}

const DEFAULT_REGISTERS: Record<Register, number> = {
	[Register.BPM]: 120,
	[Register.VOL]: 100,
	[Register.REG1]: 0,
	[Register.REG2]: 0,
};

let DEFAULT_MEMORY = new Array(256).fill(0);
DEFAULT_MEMORY[0] = 58;
DEFAULT_MEMORY[1] = 62;
DEFAULT_MEMORY[2] = 63;
DEFAULT_MEMORY[3] = 65;
DEFAULT_MEMORY[8] = 60;
DEFAULT_MEMORY[9] = 64;
DEFAULT_MEMORY[10] = 65;
DEFAULT_MEMORY[11] = 67;

export class Sequencer {
	private _audio: AudioEngine;
	private _registers: Record<Register, number> = { ...DEFAULT_REGISTERS };
	private _memory: number[] = [...DEFAULT_MEMORY];
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

	setMemory(addr: number, val: number) {
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

	private _resolveNumberOperand(operand?: Operand): number {
		if (!operand) return 0;
		switch (operand.mode) {
			case "immediate":
				return operand.value as number;
			case "register":
				return this._registers[operand.value as Register];
			case "memory": {
				const address = operand.type === "register"
					? this._registers[operand.value as Register]
					: operand.value as number;
				return this._memory[address];
			}
		}
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
			const valueOne = this._resolveNumberOperand(operandOne);
			const valueTwo = this._resolveNumberOperand(operandTwo);

			switch (instr.opcode) {
				case Opcode.PLAY:
					this._audio.play(operandOne.value as Instrument, valueTwo);
					this._notify();
					this._advanceCursor(track);
					return;
				case Opcode.REST:
					track.waitRemaining += valueOne - 1;
					this._notify();
					this._advanceCursor(track);
					return;
				case Opcode.JUMP:
					track.cursor = track.program.labels[operandOne.value as string] ?? track.cursor;
					continue;
				case Opcode.BRZ:
					if (valueOne === 0) {
						track.cursor = track.program.labels[operandTwo.value as string] ?? track.cursor;
						continue;
					}
					break;
				case Opcode.SET:
					this._applyRegister(operandOne.value as Register, valueTwo);
					break;
				case Opcode.LOAD: {
					const val = this._memory[valueTwo];
					this._applyRegister(operandOne.value as Register, val);
					break;
				}
				// case Opcode.STORE: {
				// 	const val = this._resolveValue(operandTwo);
				// 	this._memory[this._resolveValue(operandOne)] = val;
				// 	this._notify();
				// 	break;
				// }
				case Opcode.ADD:
					this._applyRegister(operandOne.value as Register, this._registers[operandOne.value as Register] + valueTwo);
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
