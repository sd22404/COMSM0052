import { parser } from "./parser";
import { Instrument, Register, Opcode, Instruction, Program } from "@/core/types";

export function compile(code: string): Program {
	const tree = parser.parse(code);
	const cursor = tree.cursor();
	const program: Program = { instructions: [], labels: {} };
	let instr: Instruction = { opcode: Opcode.NOP, operands: [] };
	let hasInstruction = false;

	do {
		const nodeText = code.slice(cursor.from, cursor.to);
		switch (cursor.node.type.name) {
			case "Instruction":
				if (hasInstruction) {
					program.instructions.push(instr);
					instr = { opcode: Opcode.NOP, operands: [] };
				} hasInstruction = true;
				break;
			case "Label":
				let label = nodeText.split(":")[0]
				program.labels[label] = program.instructions.length;
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

	if (hasInstruction) { program.instructions.push(instr); }
	return program;
}
