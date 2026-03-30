import {
	Instruction,
	Instrument,
	Memory,
	NoteEvent,
	Opcode,
	Operand,
	Program,
	Register,
	RegisterFile,
	CoreState,
	GlobalState,
	SynthSettings,
} from "@/common/types";

interface CoreConfig {
	id: number;
	event_q: NoteEvent[];
	memory: Memory;
	global_state: GlobalState;
	onChange: () => void;
	program?: Program;
}

function createSynthSettings(registers: number[], globalState: GlobalState): SynthSettings {
	const bpm_ratio = registers[Register.BPM];
	const volume_ratio = registers[Register.VOL];

	return {
		bpm: Math.max(1, (globalState.bpm * bpm_ratio) / 100),
		volume: Math.max(0, (globalState.volume * volume_ratio) / 100),
		pan: registers[Register.PAN],
		attack: registers[Register.ATK],
		decay: registers[Register.DEC],
		sustain: registers[Register.SUS],
		release: registers[Register.REL],
	};
}

export class Core {
	constructor({ id, event_q, memory, global_state, onChange, program }: CoreConfig) {
		this.id = id;
		this.event_q = event_q;
		this.memory = memory;
		this.global_state = global_state;
		this.onChange = onChange;
		this.registers = new RegisterFile();
		this.program = program ?? { instrs: [], labels: {} };
	}

	private readonly id: number;
	private enabled = false;
	private counter = 0;
	private tick = 0;
	private program: Program;
	private readonly memory: Memory;
	private readonly onChange: () => void;
	private readonly registers: RegisterFile;
	private readonly event_q: NoteEvent[];
	private readonly global_state: GlobalState;

	get active() {
		return this.enabled;
	}

	set active(enabled: boolean) {
		if (this.enabled === enabled) return;
		this.enabled = enabled;
		if (!enabled) this.halt();
	}

	get pc() {
		return this.counter;
	}

	get regs() {
		return this.registers.snapshot();
	}

	get state(): CoreState {
		return {
			id: this.id,
			active: this.enabled,
			pc: this.counter,
			tick: this.tick,
			regs: this.regs,
		};
	}

	private notify() { this.onChange?.(); }

	private eval(operand?: Operand): number {
		if (!operand) return 0;

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

	private queueNote(instrument: Instrument, pitch: number, beat: number, duration: number) {
		this.event_q.push({
			instrument,
			pitch,
			beat,
			duration,
			settings: createSynthSettings(this.regs, this.global_state),
		});
	}

	private fetch(pc: number): Instruction {
		return this.program.instrs[pc];
	}

	private decode(instr: Instruction): Instruction {
		return instr;
	}

	private execute(instr: Instruction) {
		const [raw1, raw2] = instr.operands;
		const [val1, val2] = [this.eval(raw1), this.eval(raw2)];
		const dest = (raw1 as { mode: "reg"; reg: Register }).reg;

		switch (instr.opcode) {
			case Opcode.PLAY:
				this.queueNote(val1 as Instrument, val2, 1, 1); // TODO: add duration support
				break;
			case Opcode.REST:
				this.tick += Math.max(0, val1);
				break;
			case Opcode.LOAD:
				this.registers.write(dest, val2);
			case Opcode.ADD: {
				this.registers.write(dest, this.registers.read(dest) + val2);
				break;
			}
			case Opcode.STORE:
				this.memory.write(val1, val2);
				break;
			case Opcode.JUMP:
				this.counter = val1 % this.program.instrs.length;
				break;
			case Opcode.JMPZ:
				if (val1 === 0) this.counter = val2 % this.program.instrs.length;
				break;
			case Opcode.NOP:
				break;
			default:
				break;
		}
	}

	load(program: Program) {
		this.program = program;
		if (program.instrs.length === 0) this.counter = 0;
		else this.counter %= program.instrs.length;
	}

	setRegister(register: Register, value: number) {
		this.registers.write(register, value);
		// TODO: cleanly handle bpm changes
	}

	step() {
		if (!this.enabled || this.program.instrs.length === 0) return;

		this.execute(this.decode(this.fetch(this.counter++)));
		this.counter %= this.program.instrs.length;
		this.notify();
	}

	run() {
		if (!this.enabled) return;
		// TODO: execute code until the next rest
	}

	halt() {
		// TODO: stop executing

		this.counter = 0;
		this.notify();
	}

	reset() {
		this.counter = 0;
		this.registers.reset();
		this.notify();
	}
}
