import { AccessLog } from "./log";

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
		this.mem.fill(0);
	}

	normalise(addr: number) {
		return ((addr % this.mem.length) + this.mem.length) % this.mem.length;
	}

	read(addr: number): number {
		const normalised = this.normalise(addr);
		this.log.recordMemory(normalised, "read");
		return this.mem[normalised];
	}

	write(addr: number, value: number) {
		const normalised = this.normalise(addr);
		this.mem[normalised] = value;
		this.log.recordMemory(normalised, "write");
	}
}
