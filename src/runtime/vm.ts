import { Opcode, Operand, Track, NoteEvent, Register, Instrument } from "@/core/types";

interface State {
	registers: Record<Register, number>;
	memory: number[];
}

const DEFAULT_REGISTERS: Record<Register, number> = {
	[Register.BPM]: 120,
	[Register.VOL]: 100,
	[Register.REG1]: 0,
	[Register.REG2]: 0,
};

const DEFAULT_MEMORY = new Array(256).fill(0);
DEFAULT_MEMORY[0] = 58;
DEFAULT_MEMORY[1] = 62;
DEFAULT_MEMORY[2] = 63;
DEFAULT_MEMORY[3] = 65;
DEFAULT_MEMORY[8] = 60;
DEFAULT_MEMORY[9] = 64;
DEFAULT_MEMORY[10] = 65;
DEFAULT_MEMORY[11] = 67;

export class VM {
	state: State = {
		registers: { ...DEFAULT_REGISTERS },
		memory: [ ...DEFAULT_MEMORY ],
	};

	private tracks: Record<string, Track> = {};
	private _broadcast?: (state: State) => void;

	set broadcast(fn: (state: State) => void) {
		this._broadcast = fn;
	}

	setTracks(tracks: Track[]) {
		const new_tracks: Record<string, Track> = {};

		for (const t of tracks) {
			const old = this.tracks[t.name];
			if (old) {
				t.pc = Math.max(Math.min(old.pc, t.instrs.length - 1), 0);
				t.time = old.time;
			}

			new_tracks[t.name] = t;
		}

		this.tracks = new_tracks;
	}

	resetTracks() {
		Object.values(this.tracks).forEach(t => {
			t.pc = 0;
			t.time = 0;
		});
	}

	setAddress(addr: number, val: number) {
		this.state.memory[addr] = val;
		this._broadcast?.(this.state);
	}

	getAddress(addr: number): number {
		return this.state.memory[addr] ?? 0;
	}

	setRegister(reg: Register, val: number) {
		this.state.registers[reg] = val;
		this._broadcast?.(this.state);
	}

	getRegister(reg: Register): number {
		return this.state.registers[reg] ?? 0;
	}

	seek(until: number): NoteEvent[] {
		const events: NoteEvent[] = [];
		for (const track of Object.values(this.tracks)) {
			let iterations = 0;
			while (track.time < until && iterations++ < 1000) {
				const event = this.stepTrack(track);
				if (event) events.push(event);
			}
		}

		// reverse order
		return events.sort((a, b) => b.time - a.time);
	}

	private stepTrack(track: Track): NoteEvent | null {
		if (track.instrs.length === 0) return null;

		const instr = track.instrs[track.pc++];
		track.pc %= track.instrs.length;

		const [op1, op2] = instr.operands.map(op => this.eval(op));

		switch(instr.opcode) {
			case Opcode.PLAY:
				return { instrument: op1 as Instrument, pitch: op2 as number, duration: undefined, time: track.time, line: instr.line };
			case Opcode.REST:
				const beats = op1 as number;
				const ticks = 2;
				const bpm = this.getRegister(Register.BPM);
				const seconds = (60.0 * beats) / (bpm * ticks);
				track.time += seconds;
				break;
			case Opcode.JUMP:
				track.pc = track.labels[op1 as string] ?? track.pc;
				break;
			case Opcode.BRZ:
				if (this.getRegister(op1 as Register) === 0) {
					track.pc = track.labels[op2 as string] ?? track.pc;
				}
				break;
			case Opcode.ADD: {
				const reg = op1 as Register;
				this.setRegister(reg, this.getRegister(reg) + (op2 as number));
				break;
			}
			case Opcode.LOAD: {
				const reg = op1 as Register; const val = op2 as number;
				this.setRegister(reg, val);
				break;
			}
			case Opcode.STORE: {
				const reg = op1 as Register; const addr = op2 as number;
				this.setAddress(addr, this.getRegister(reg));
				break;
			}
		}

		return null;
	}

	private eval(operand: Operand): number | string {
		switch (operand.mode) {
			case "immediate":
				return operand.value;
			case "memory": {
				if (operand.type === "register") {
					const addr = this.getRegister(operand.value as Register);
					return this.getAddress(addr);
				}

				const addr = operand.value as number;
				return this.getAddress(addr);
			}
		}
	}
}
