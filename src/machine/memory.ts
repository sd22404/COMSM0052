const MEMORY_SIZE = 32;

export function createDefaultMemory(size: number = MEMORY_SIZE): number[] {
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
	constructor(private readonly size: number = MEMORY_SIZE) {
		this.mem = createDefaultMemory(size);
	}

	private mem: number[];

	snapshot() {
		return [...this.mem];
	}

	reset() {
		this.mem.fill(0);
	}

	private normalise(addr: number) {
		return ((addr % this.mem.length) + this.mem.length) % this.mem.length;
	}

	read(addr: number): number {
		return this.mem[this.normalise(addr)];
	}

	write(addr: number, value: number) {
		this.mem[this.normalise(addr)] = value;
	}
}
