import { AccessMode, EventLog, MemoryAccess, Register, RegisterAccess } from "@/common/types";

interface AccessMark {
	register: number;
	memory: number;
}

export class AccessLog {
	private registers: RegisterAccess[][] = [];
	private memory: MemoryAccess[] = [];

	mark(coreID: number): AccessMark {
		return {
			register: this.registers[coreID]?.length ?? 0,
			memory: this.memory.length,
		};
	}

	since(coreID: number, mark: AccessMark): EventLog {
		return {
			registers: (this.registers[coreID] ?? []).slice(mark.register),
			memory: this.memory.slice(mark.memory),
		};
	}

	recordRegister(coreID: number, reg: Register, mode: AccessMode) {
		const regs = this.registers[coreID]
			?? (this.registers[coreID] = []);
		regs.push({ reg, mode });
	}

	recordMemory(addr: number, mode: AccessMode) {
		this.memory.push({ addr, mode });
	}

	clear() {
		this.registers = [];
		this.memory = [];
	}
}
