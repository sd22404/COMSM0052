import { Register } from "@/common/types";

export function createDefaultRegisters(): number[] {
	return [
		100, // Volume
		0,   // Pan
		0,   // Attack
		0,   // Decay
		100, // Sustain
		0,   // Release
		100, // RAND
		0,   // REG0
		0,   // REG1
		0,   // REG2
		0,   // REG3
	];
}

export class RegisterFile {
	private regs: number[] = createDefaultRegisters();

	snapshot() {
		return [...this.regs];
	}

	reset() {
		this.regs = createDefaultRegisters();
	}

	read(reg: Register): number {
		if (reg == Register.RAND)
			return Math.floor(Math.random() * this.regs[Register.RAND] + 1);
		return this.regs[reg];
	}

	write(reg: Register, value: number) {
		this.regs[reg] = value;
	}
}
