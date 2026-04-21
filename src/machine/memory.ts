import { AccessLog } from "./log";

export class MemoryAddressError extends Error {
	constructor(public readonly addr: number, size: number) {
		super(`Memory address ${addr} is out of range. Valid addresses are 0-${size - 1}.`);
		this.name = "MemoryAddressError";
	}
}

export function createDefaultMemory(size: number): number[] {
	const mem = new Array(size).fill(0);
	mem[0] = 58;
	mem[1] = 62;
	mem[2] = 63;
	mem[3] = 65;
	mem[8] = 60;
	mem[9] = 64;
	mem[10] = 65;
	mem[11] = 67;
	return mem;
}

export class Memory {
	constructor(size: number, log: AccessLog ) {
		this.mem = createDefaultMemory(size);
		this.log = log;
	}

	private readonly log: AccessLog;
	private mem: number[];

	snapshot() {
		return [...this.mem];
	}

	reset() {
		this.mem = createDefaultMemory(this.mem.length);
	}

	private resolveAddress(addr: number) {
		if (!Number.isInteger(addr) || addr < 0 || addr >= this.mem.length)
			throw new MemoryAddressError(addr, this.mem.length);

		return addr;
	}

	read(addr: number): number {
		const resolved = this.resolveAddress(addr);
		this.log.recordMemory(resolved, "read");
		return this.mem[resolved];
	}

	write(addr: number, value: number) {
		const resolved = this.resolveAddress(addr);
		this.mem[resolved] = value;
		this.log.recordMemory(resolved, "write");
	}
}
