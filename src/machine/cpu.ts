import { Program, Instruction, Opcode, Operand, Memory, RegisterFile, NoteEvent, Instrument, Register } from "@/common/types";

const STEP_INTERVAL = 500;

export class Core {
	constructor(event_q: NoteEvent[], memory?: Memory, registers?: RegisterFile, program?: Program) {
		this.event_q = event_q;
		this.program = program ?? {} as Program;
		this.memory = memory ?? new Memory();
		this.registers = registers ?? new RegisterFile();
	}

	private enabled: boolean = false;
	private counter: number = 0;
	private program: Program;
	private memory: Memory;
	private registers: RegisterFile;
	private event_q: NoteEvent[];
	private step_interval?: NodeJS.Timeout;

	get active() {
		return this.enabled;
	}

	set active(enabled: boolean) {
		this.enabled = enabled;
		if (!enabled) this.halt();
	}

	get pc() {
		return this.counter;
	}

	get mem() {
		return [...this.memory.data];
	}

	get regs() {
		return [...this.registers.data];
	}

	private fetch(pc: number): Instruction {
		return this.program.instrs[pc] ?? { opcode: Opcode.NOP, operands: [] };
	}

	private decode(instr: Instruction): Instruction {
		return instr;
	}

	private execute(instr: Instruction) {
		const [raw1, raw2] = instr.operands;
		const [val1, val2] = [raw1, raw2].map(op => this.eval(op));
		const dest = (raw1 as { mode: "reg"; reg: Register }).reg;

		switch(instr.opcode) {
			case Opcode.PLAY:
				this.event_q.push({ instrument: val1 as Instrument, pitch: val2, duration: 1 });
				break;
			case Opcode.REST:
				break;
			case Opcode.LOAD:
				this.registers.write(dest, val2);
				break;
			case Opcode.STORE:
				this.memory.write(val1, val2);
				break;
			case Opcode.ADD:
				this.registers.write(dest, this.registers.read(dest) + val2);
				break;
			case Opcode.JUMP:
				this.counter = val1;
				break;
			case Opcode.JMPZ:
				if (val1 === 0) this.counter = val2;
				break;
			case Opcode.NOP:
				break;
			default:
				console.error(`Unknown opcode ${instr.opcode}`);
		}

		console.log(this.regs);
	}

	private eval(operand: Operand): number {
		switch (operand.mode) {
			case "mem_direct":
				return this.memory.read(operand.address);
			case "mem_indirect":
				return this.memory.read(this.registers.read(operand.reg));
			case "reg":
				return this.registers.read(operand.reg);
			case "label":
				return this.program.labels[operand.value] ?? 0;
			default:
				return operand.value;
		}
	}

	load(program: Program) {
		console.log(program);
		this.program = program;
		this.counter %= this.program.instrs.length;
	}

	private step() {
		if (!this.enabled) return;
		this.execute(this.decode(this.fetch(this.counter++)));
		this.counter %= this.program.instrs.length;
	}

	run() {
		this.step_interval = setInterval(() => this.step(), STEP_INTERVAL);
	}

	halt() {
		if (this.step_interval) {
			clearInterval(this.step_interval);
			this.step_interval = undefined;
		}

		this.counter = 0;
	}
}
