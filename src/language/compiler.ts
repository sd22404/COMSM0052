import { parser } from "./parser";
import { Track, Instrument, Register, Opcode, Instruction, Program } from "@/core/types";

export function compile(code: string): Track[] {
	const tree = parser.parse(code);
	const cursor = tree.cursor();
	const tracks: Track[] = [];
	let track: Track = { name: "default", start: 1, program: { instructions: [], labels: {} }, cursor: 0, currentBeat: 0 };
	let instr: Instruction = { opcode: Opcode.NOP, operands: [] };
	let hasInstruction = false;

	console.log(tree.toString());

	do {
		const nodeText = code.slice(cursor.from, cursor.to);
		switch (cursor.node.type.name) {
			case "Track": {
				if (hasInstruction) {
					track.program.instructions.push(instr);
					instr = { opcode: Opcode.NOP, operands: [] };
					hasInstruction = false;
				}

				if (track.program.instructions.length > 0) tracks.push(track);
				
				let trackName = nodeText.split(" ")[1].replace(RegExp(/:\n/g), "");
				track = { name: trackName, start: code.slice(0, cursor.to).split("\n").length - 1, program: { instructions: [], labels: {} }, cursor: 0, currentBeat: 0 };
				break;
			}
			case "Instruction":
				if (hasInstruction) {
					track.program.instructions.push(instr);
					instr = { opcode: Opcode.NOP, operands: [] };
				} hasInstruction = true;
				break;
			case "Label":
				let label = nodeText.split(":")[0]
				track.program.labels[label] = track.program.instructions.length + (hasInstruction ? 1 : 0);
				break;
			case "Opcode":
				instr.opcode = nodeText as Opcode;
				break;
			case "Instrument":
				instr.operands.push(nodeText as Instrument);
				break;
			case "Register":
				instr.operands.push(nodeText as Register);
				break;
			case "Number":
				instr.operands.push(parseInt(nodeText));
				break;
			case "Note":
			case "Identifier":
				instr.operands.push(nodeText);
				break;
			default:
				break;
		}
	} while (cursor.next());

	if (hasInstruction) { track.program.instructions.push(instr); }
	tracks.push(track);

	return tracks;
}
