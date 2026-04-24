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
import { Memory, MemoryAddressError } from "@/machine/memory";
import { RegisterFile, createDefaultRegisters } from "@/machine/regfile";

export const ZERO_TIME_BUDGET = 4096;

export function createDefaultCore(id: number): CoreState {
	return {
		id,
		enabled: false,
		pc: 0,
		tick: 0,
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

function clampTick(value: number) {
	return Math.max(0, value);
}

function createSynthSettings(registers: number[], parameters: number[]): SynthSettings {
	return {
		volume: Math.max(0, (parameters[Parameter.VOL] * registers[Register.VOL]) / 100),
		pan: registers[Register.PAN],
		attack: registers[Register.ATK],
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
	private _tick = 0;
	private _fault?: RuntimeFault;
	private zeroTimeSteps = 0;

	get pc() {
		return this._pc;
	}

	get tick() {
		return this._tick;
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
			tick: this.tick,
			regs: this.regs,
			fault: this.fault,
		};
	}

	load(program: Program, startTick = this._tick) {
		const wasEnabled = this._enabled;
		this.program = program;
		this.clearFault();

		if (this._pc >= program.length)
			this._pc = 0;

		this._enabled = true;
		if (!wasEnabled)
			this._tick = clampTick(startTick);
	}

	setRegister(reg: Register, val: number) {
		this.registers.write(reg, val);
	}

	setEnabled(enabled: boolean, startTick = this._tick) {
		this._enabled = enabled;
		if (!enabled) return;

		this.clearFault();
		this.rewind(startTick);
	}

	resetPC() {
		this._pc = 0;
		this.zeroTimeSteps = 0;
	}

	reset(startTick?: number) {
		this.registers.reset();
		this._enabled = false;
		this.clearFault();
		this.rewind(startTick);
	}

	private clearFault() {
		this._fault = undefined;
		this.zeroTimeSteps = 0;
	}

	private raiseFault(message: string, instr: Instruction) {
		this._fault = {
			message,
			span: instr.span,
			tick: this._tick,
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
		const tick = this._tick;
		const mark = this.log.mark(this.id);
		let note: Note | undefined;

		try {
			switch (instr.opcode) {
				case Opcode.PLAY: {
					const [device, pitch, duration] = instr.operands;
					const length = duration ? this.eval(duration) : 1;
					if (length <= 0) {
						this.raiseFault(`PLAY duration must be a positive value, received ${length}.`, instr);
						break;
					}

					note = this.createNote(device.device, this.eval(pitch), length);
					break;
				}
				case Opcode.REST: {
					const [ticks] = instr.operands;
					const tick = this.eval(ticks);
					if (tick <= 0) {
						this.raiseFault(`REST must advance by a positive value, received ${tick}.`, instr);
						break;
					}

					this._tick = clampTick(this._tick + tick);
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
		} catch (error) {
			if (error instanceof MemoryAddressError) {
				this.raiseFault(error.message, instr);
			} else {
				throw error;
			}
		}

		return {
			id: this.seq++,
			coreID: this.id,
			tick: tick,
			span: instr.span,
			log: this.log.since(this.id, mark),
			note,
		};
	}

	step(): ExecEvent | undefined {
		if (!this._enabled || this._fault || this.program.length === 0) return undefined;

		const tickBefore = this._tick;
		const instr = this.fetch(this._pc++);
		const event = this.execute(instr);

		if (this._fault) return event;

		if (this._tick > tickBefore) {
			this.zeroTimeSteps = 0;
			return event;
		}

		this.zeroTimeSteps++;
		if (this.zeroTimeSteps >= ZERO_TIME_BUDGET)
			this.raiseFault(`Exceeded ${ZERO_TIME_BUDGET} zero-time instructions. Try adding a REST instruction.`, instr);

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

	private rewind(startTick = 0) {
		this.resetPC();
		this._tick = clampTick(startTick);
	}
}
