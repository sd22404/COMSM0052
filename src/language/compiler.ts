import { parser } from "./parser";
import { Track, Instrument, Register, Opcode, Instruction } from "@/core/types";

function newTrack(name: string): Track {
	return { name, program: { instructions: [], labels: {} }, cursor: 0, waitRemaining: 0 };
}

function newInstr(line: number): Instruction {
	return { opcode: Opcode.NOP, operands: [], line };
}

export function compile(code: string): Track[] {
	const tree = parser.parse(code);
	const cursor = tree.cursor();
	const tracks: Track[] = [];
	let track = newTrack("default");

	console.log(tree.toString());

	do {
		const nodeText = code.slice(cursor.from, cursor.to);
		const instr = track.program.instructions.at(-1);

		switch (cursor.node.type.name) {
			case "Track": {
				if (track.program.instructions.length > 0) tracks.push(track);
				let trackName = nodeText.split(" ")[1].replace(RegExp(/:\n/g), "");
				track = newTrack(trackName);
				break;
			}
			case "Instruction": {
				const line = code.slice(0, cursor.from).split('\n').length;
				track.program.instructions.push(newInstr(line));
				break;
			}
			case "Label":
				const label = nodeText.split(":")[0]
				track.program.labels[label] = track.program.instructions.length;
				break;
			case "Opcode":
				if (instr) instr.opcode = nodeText as Opcode;
				break;
			case "Instrument":
				if (instr) instr.operands.push({ mode: "immediate", type: "instrument", value: nodeText as Instrument });
				break;
			case "Register":
				if (instr) instr.operands.push({ mode: "register", type: "register", value: nodeText as Register });
				break;
			case "Immediate":
				if (instr) instr.operands.push({ mode: "immediate", type: "number", value: parseInt(nodeText) });
				break;
			case "Memory":
				if (instr) {
					const address = nodeText.slice(1, -1).trim();
					const asNum = parseInt(address);
					if (isNaN(asNum)) instr.operands.push({ mode: "memory", type: "register", value: address as Register });
					else instr.operands.push({ mode: "memory", type: "number", value: asNum });
				}
				break;
			case "Note":
			case "Identifier":
				if (instr) instr.operands.push({ mode: "immediate", type: "identifier", value: nodeText });
				break;
		}
	} while (cursor.next());

	tracks.push(track);
	console.log(tracks);

	return tracks;
}
