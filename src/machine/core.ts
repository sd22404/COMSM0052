import {
	CoreState,
	ExecEvent,
	Instruction,
	Program,
	Device,
	Note,
	Opcode,
	ValOperand,
	Parameter,
	Register,
	RuntimeFault,
	SynthSettings,
	OpType,
} from "@/common/types";
import { AccessLog } from "@/machine/log";
import { Memory } from "@/machine/memory";
import { RegisterFile, createDefaultRegisters } from "@/machine/regfile";

export const ZERO_TIME_BUDGET = 4096;

export function createDefaultCore(id: number): CoreState {
	return {
		id,
		enabled: false,
		pc: 0,
		beat: 0,
		regs: createDefaultRegisters(),
	};
}

interface CoreConfig {
	id: number;
	log: AccessLog;
	memory: Memory;
	parameters: number[];
	program?: Program;
}

function clampBeat(value: number) {
	return Math.max(0, value);
}

function createSynthSettings(registers: number[], parameters: number[]): SynthSettings {
	return {
		volume: Math.max(0, (parameters[Parameter.VOL] * registers[Register.VOL]) / 100),
		pan: registers[Register.PAN],
		attack: registers[Register.ATK],
		decay: registers[Register.DEC],
		sustain: registers[Register.SUS],
		release: registers[Register.REL],
	};
}

export class Core {
	constructor({ id, memory, log, parameters, program }: CoreConfig) {
		this.id = id;
		this.log = log;
		this.memory = memory;
		this.parameters = parameters;
		this.registers = new RegisterFile(this.id, this.log);
		this.program = program ?? [];
	}

	private readonly id: number;
	private readonly log: AccessLog;
	private readonly memory: Memory;
	private readonly parameters: number[];
	private readonly registers: RegisterFile;
	private program: Program;
	private seq = 0;
	private _enabled = false;
	private _pc = 0;
	private _beat = 0;
	private _fault?: RuntimeFault;
	private zeroTimeSteps = 0;

	get pc() {
		return this._pc;
	}

	get beat() {
		return this._beat;
	}

	get regs() {
		return this.registers.snapshot();
	}

	get enabled() {
		return this._enabled;
	}

	get fault() {
		return this._fault;
	}

	get hasProgram() {
		return this.program.length > 0;
	}

	get state(): CoreState {
		return {
			id: this.id,
			enabled: this.enabled,
			pc: this.pc,
			beat: this.beat,
			regs: this.regs,
			fault: this.fault,
		};
	}

	load(program: Program) {
		this.program = program;
		this.clearFault();
		this.rewind();
	}

	setRegister(reg: Register, val: number) {
		this.registers.write(reg, val);
	}

	setEnabled(enabled: boolean, startBeat = this._beat) {
		this._enabled = enabled;
		if (!enabled) return;

		this.clearFault();
		this.rewind(startBeat);
	}

	reset(startBeat?: number) {
		this.registers.reset();
		this._enabled = false;
		this.clearFault();
		this.rewind(startBeat);
	}

	private clearFault() {
		this._fault = undefined;
		this.zeroTimeSteps = 0;
	}

	private raiseFault(message: string, instr: Instruction) {
		this._fault = {
			message,
			span: instr.span,
			beat: this._beat,
			pc: this.normalise(this._pc - 1),
		};
		this._enabled = false;
	}

	private eval(operand: ValOperand): number {
		switch (operand.type) {
			case OpType.Imm:
				return operand.value;
			case OpType.Reg:
				return this.registers.read(operand.reg);
			case OpType.Mem: {
				if (operand.addr.type === OpType.Imm)
					return this.memory.read(operand.addr.value);
				const addr = this.registers.read(operand.addr.reg);
				return this.memory.read(addr);
			}
		}
	}

	private normalise(pc: number): number {
		if (this.program.length === 0) return 0;
		return (pc % this.program.length + this.program.length) % this.program.length;
	}

	private fetch(pc: number): Instruction {
		return this.program[this.normalise(pc)];
	}

	private execute(instr: Instruction): ExecEvent {
		const beat = this._beat;
		const mark = this.log.mark(this.id);
		let note: Note | undefined;

		switch (instr.opcode) {
			case Opcode.PLAY: {
				const [device, pitch] = instr.operands;
				note = this.createNote(device.device, this.eval(pitch), 1); // TODO: implement duration
				break;
			}
			case Opcode.REST: {
				const [beats] = instr.operands;
				const beat = this.eval(beats);
				if (beat <= 0) {
					this.raiseFault(`REST must advance by a positive value, received ${beat}.`, instr);
					break;
				}

				this._beat = clampBeat(this._beat + beat);
				break;
			}
			case Opcode.LOAD: {
				const [dest, val] = instr.operands;
				this.registers.write(dest.reg, this.eval(val));
				break;
			}
			case Opcode.STORE: {
				const [addr, val] = instr.operands;
				this.memory.write(this.eval(addr), this.eval(val));
				break;
			}
			case Opcode.ADD: {
				const [dest, val] = instr.operands;
				this.registers.write(dest.reg, this.registers.read(dest.reg) + this.eval(val));
				break;
			}
			case Opcode.JUMP: {
				const [target] = instr.operands;
				this._pc = this.normalise(target.addr);
				break;
			}
			case Opcode.JMPZ: {
				const [test, target] = instr.operands;
				if (this.registers.read(test.reg) === 0)
					this._pc = this.normalise(target.addr);
				break;
			}
		}

		return {
			id: this.seq++,
			coreID: this.id,
			beat,
			span: instr.span,
			log: this.log.since(this.id, mark),
			note,
		};
	}

	step(): ExecEvent | undefined {
		if (!this._enabled || this._fault || this.program.length === 0) return undefined;

		const beatBefore = this._beat;
		const instr = this.fetch(this._pc++);
		const event = this.execute(instr);

		if (this._fault) return event;

		if (this._beat > beatBefore) {
			this.zeroTimeSteps = 0;
			return event;
		}

		this.zeroTimeSteps++;
		if (this.zeroTimeSteps >= ZERO_TIME_BUDGET)
			this.raiseFault(`Exceeded ${ZERO_TIME_BUDGET} zero-time instructions.`, instr);

		return event;
	}

	private createNote(device: Device, pitch: number, length: number): Note {
		return {
			length,
			device,
			pitch,
			settings: createSynthSettings(this.regs, this.parameters),
		};
	}

	private rewind(startBeat = 0) {
		this._pc = 0;
		this._beat = clampBeat(startBeat);
		this.zeroTimeSteps = 0;
	}
}
