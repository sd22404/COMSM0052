import { Track, Program, Opcode, Instrument, Register } from "@/core/types";
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
	private _onStateChange?: (state: SequencerState) => void;

	constructor(audio: AudioEngine) {
		this._audio = audio;
	}

	set onStateChange(fn: (state: SequencerState) => void) {
		this._onStateChange = fn;
	}

	get state(): SequencerState {
		return { registers: { ...this._registers }, memory: [...this._memory], running: this._running, cursors: this._tracks.map(t => t.cursor + t.start) };
	}

	setTracks(tracks: Track[]) {
		this._tracks = tracks;
		console.log(tracks);
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
		this._registers[reg] = val;
		switch (reg) {
			case Register.BPM: this._audio.bpm = val; break;
			case Register.VOL: this._audio.volume = val; break;
		}
	}

	private _notify() {
		this._onStateChange?.(this.state);
	}

	private _secondsToBeats(seconds: number) {
		return seconds / (this._audio.clickMs / 1000);
	}

	async run() {
		this._running = true;
		this._notify();

		const scheduleSeconds = 0.3;
		const tickMs = 150;

		while (this._running) {
			const beatLimit = this._secondsToBeats(this._audio.currentTime() + scheduleSeconds);
			this._tracks.forEach(t => {
				let safety = 0;
				while (t.currentBeat < beatLimit && safety++ < 10000) { this._stepTrack(t); }
			});

			this._notify();
			await new Promise(r => setTimeout(r, tickMs));
		}

		this._running = false;
		this._notify();
	}

	private _stepTrack(track: Track) {
		const instruction = track.program.instructions[track.cursor];
		if (!instruction) return;

		switch (instruction.opcode) {
			case Opcode.PLAY:
				let instrument = instruction.operands[0] as Instrument;
				let note = instruction.operands[1] as string;
				let intNote = parseInt(note);
				if (!isNaN(intNote)) note = this._memory[intNote] as string;
				else if (note in this._registers) note = this._memory[this._registers[note as Register]] as string;
				this._audio.play(
					instrument,
					note,
					undefined,
					track.currentBeat,
				);
				track.currentBeat++;
				break;
			case Opcode.WAIT:
				track.currentBeat += instruction.operands[0] as number;
				break;
			case Opcode.JUMP: {
				track.cursor = track.program.labels[instruction.operands[0] as string] ?? track.cursor;
				this._notify();
				return;
			}
			case Opcode.SET: {
				let reg = instruction.operands[0] as Register;
				let operand = instruction.operands[1] as Register;
				let val = this._registers[operand] ?? parseInt(operand);
				this.setRegister(reg, val);
				break;
			}
			case Opcode.LOAD: {
				let dest = instruction.operands[0] as Register;
				let src = instruction.operands[1] as Register;
				let imm = instruction.operands[1] as number;
				let val = this._memory[this._registers[src] ?? imm];
				let intVal = parseInt(val as string);
				if (!isNaN(intVal)) this.setRegister(dest, intVal);
				break;
			}
			case Opcode.ADD: {
				let dest = instruction.operands[0] as Register;
				let src = instruction.operands[1] as Register;
				let imm = instruction.operands[1] as number;
				let val = this._registers[src] ?? imm;
				this.setRegister(dest, this._registers[dest] + val);
				break;
			}
		}

		track.cursor++;
		track.cursor %= track.program.instructions.length;
		this._notify();
	}

	halt() {
		this._running = false;
		this._applyRegister(Register.BPM, DEFAULT_REGISTERS[Register.BPM]);
		this._applyRegister(Register.VOL, DEFAULT_REGISTERS[Register.VOL]);
		this._notify();
	}
}
