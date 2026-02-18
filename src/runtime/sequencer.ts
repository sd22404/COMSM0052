import { Program, Opcode, Instrument, Register } from "@/core/types";
import { AudioEngine } from "@/audio/engine";

export interface SequencerState {
	registers: Record<Register, number>;
	memory: number[];
	running: boolean;
}

const DEFAULT_REGISTERS: Record<Register, number> = {
	[Register.BPM]: 120,
	[Register.VOL]: 100,
	[Register.REG1]: 0,
	[Register.REG2]: 0,
	[Register.REG3]: 0,
	[Register.REG4]: 0,
};

export class Sequencer {
	private _audio: AudioEngine;
	private _registers: Record<Register, number> = { ...DEFAULT_REGISTERS };
	private _memory: number[] = new Array(256).fill(0);
	private _program: Program = { instructions: [], labels: {} };
	private _cursor = 0;
	private _running = false;
	private _onStateChange?: (state: SequencerState) => void;

	constructor(audio: AudioEngine) {
		this._audio = audio;
	}

	set onStateChange(fn: (state: SequencerState) => void) {
		this._onStateChange = fn;
	}

	get state(): SequencerState {
		return { registers: { ...this._registers }, memory: [...this._memory], running: this._running };
	}

	setProgram(program: Program) {
		this._program = program;
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
		if (val < 0) return;
		this._registers[reg] = val;
		switch (reg) {
			case Register.BPM: this._audio.bpm = val; break;
			case Register.VOL: this._audio.volume = val; break;
		}
	}

	private _notify() {
		this._onStateChange?.(this.state);
	}

	async run() {
		this._audio.start();
		this._running = true;
		this._notify();

		while (this._running) {
			const instruction = this._program.instructions[this._cursor];
			if (!instruction) break;

			switch (instruction.opcode) {
				case Opcode.PLAY:
					this._audio.play(
						instruction.operands[0] as Instrument,
						instruction.operands[1] as string
					);
					break;
				case Opcode.WAIT:
					await new Promise(resolve =>
						setTimeout(resolve, (instruction.operands[0] as number) * this._audio.clickMs)
					);
					break;
				case Opcode.JUMP:
					this._cursor = this._program.labels[instruction.operands[0] as string] ?? this._cursor;
					break;
				case Opcode.SET:
					let reg = instruction.operands[0] as Register;
					let operand = instruction.operands[1] as Register;
					let isReg = operand in this._registers;
					let val = isReg ? this._registers[operand] : parseInt(operand);
					this.setRegister(reg, val);
					console.log(`Set ${Register[reg]} to ${val}`);
					console.log(instruction)
					break;
			}

			this._cursor = (this._cursor + 1) % this._program.instructions.length;
		}

		this._running = false;
		this._notify();
	}

	halt() {
		this._running = false;
		this._applyRegister(Register.BPM, DEFAULT_REGISTERS[Register.BPM]);
		this._applyRegister(Register.VOL, DEFAULT_REGISTERS[Register.VOL]);
		this._notify();
	}
}
