import { parser } from "./parser";
import { Track, Instrument, Register, Opcode, Instruction } from "@/core/types";

function newTrack(name: string): Track {
	return { name, instrs: [], labels: {}, pc: 0, time: 0 };
}

function newInstr(line: number): Instruction {
	return { opcode: Opcode.NOP, operands: [], line };
}

export function compile(code: string): Track[] {
	const tree = parser.parse(code);
	const cursor = tree.cursor();
	const tracks: Track[] = [];
	let track = newTrack("default");

	do {
		const nodeText = code.slice(cursor.from, cursor.to);
		const instr = track.instrs.at(-1);

		switch (cursor.node.type.name) {
			case "Track": {
				if (track.instrs.length > 0) tracks.push(track);
				const trackName = nodeText.split(" ")[1].replace(RegExp(/:\n/g), "");
				track = newTrack(trackName);
				break;
			}
			case "Instruction": {
				const line = code.slice(0, cursor.from).split('\n').length;
				track.instrs.push(newInstr(line));
				break;
			}
			case "Label":
				const label = nodeText.split(":")[0]
				track.labels[label] = track.instrs.length;
				break;
			case "Opcode":
				if (instr) instr.opcode = nodeText as Opcode;
				break;
			case "Instrument":
				if (instr) instr.operands.push({ mode: "immediate", type: "instrument", value: nodeText as Instrument });
				break;
			case "Register":
				if (instr) instr.operands.push({ mode: "immediate", type: "register", value: nodeText as Register });
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
				if (instr) instr.operands.push({ mode: "immediate", type: "string", value: nodeText });
				break;
		}
	} while (cursor.next());

	tracks.push(track);

	return tracks;
}
