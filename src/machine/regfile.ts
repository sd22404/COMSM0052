import { Register } from "@/common/types";
import { AccessLog } from "./log";

export function createDefaultRegisters(): number[] {
	return [
		100, // Volume
		0,   // Pan
		10,  // Attack
		40,  // Decay
		100, // Sustain
		40,  // Release
		0,   // REG0
		0,   // REG1
		0,   // REG2
		0,   // REG3
		8,   // Random
	];
}

export class RegisterFile {
	constructor(id: number, log: AccessLog) {
		this.id = id;
		this.log = log;
		this.regs = createDefaultRegisters();
	}

	private readonly id: number;
	private readonly log: AccessLog;
	private regs: number[];

	snapshot() {
		return [...this.regs];
	}

	reset() {
		this.regs = createDefaultRegisters();
	}

	read(reg: Register): number {
		this.log.recordRegister(this.id, reg, "read");
		if (reg == Register.RAND) {
			const bound = this.regs[Register.RAND];
			if (bound <= 0) return 0;
			return Math.floor(Math.random() * (bound + 1));
		}

		return this.regs[reg];
	}

	write(reg: Register, value: number) {
		this.regs[reg] = value;
		this.log.recordRegister(this.id, reg, "write");
	}
}
