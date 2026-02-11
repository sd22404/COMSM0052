import { Program, Opcode, Instrument, Register } from "@/core/types";
import { AudioEngine } from "@/audio/engine";

export class Sequencer {
	private _audioEngineRef: React.RefObject<AudioEngine>;
	private _program: Program;
	private _cursor: number = 0;
	private _running: boolean = false;

	constructor(program: Program, audioEngineRef: React.RefObject<AudioEngine>) {
		this._program = program;
		this._audioEngineRef = audioEngineRef;
	}

	set program(program: Program) {
		this._program = program;
	}

	async run() {
		this._audioEngineRef.current.start();
		this._running = true;
		while (this._running) {
			const instruction = this._program.instructions[this._cursor];
			if (!instruction) break;
			switch(instruction.opcode) {
				case Opcode.PLAY:
					this._audioEngineRef.current?.play(
						instruction.operands[0] as Instrument,
						instruction.operands[1] as string
					);
					break;
				case Opcode.WAIT:
					await new Promise(resolve => setTimeout(resolve, instruction.operands[0] as number * this._audioEngineRef.current?.clickMs));
					break;
				case Opcode.JUMP:
					this._cursor = this._program.labels[instruction.operands[0] as string] ?? this._cursor;
					break;
				case Opcode.SET: {
					const reg = instruction.operands[0] as Register;
					const val = instruction.operands[1] as number ?? 0;
					switch (reg) {
						case Register.BPM:
							this._audioEngineRef.current!.bpm = val;
							break;
						case Register.VOL:
							this._audioEngineRef.current!.volume = val;
							break;
					}
					break;
				}
			}

			this._cursor = (this._cursor + 1) % this._program.instructions.length;
		}
	}

	halt() { this._running = false; this._audioEngineRef.current!.bpm = 120; this._audioEngineRef.current!.volume = 100; }
}
