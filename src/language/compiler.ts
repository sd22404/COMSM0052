import { parser } from "./parser";
import { Program, Instruction, Opcode, Register, Instrument } from "@/common/types";

export class Compiler {
	compile(code: string) {
		const tree = parser.parse(code);
		const cursor = tree.cursor();
		const program: Program = { instrs: [], labels: {} };
		let instr: Instruction = { opcode: Opcode.NOP, operands: [] };

		do {
			const nodeText = code.slice(cursor.from, cursor.to);
			instr = program.instrs.at(-1)!;
			
			switch (cursor.node.type.name) {
				case "Instruction":
					program.instrs.push({ opcode: Opcode.NOP, operands: [] });
					break;
				case "Label":
					program.labels[nodeText.split(":").at(0)!] = program.instrs.length;
					break;
				case "Opcode":
					instr.opcode = Opcode[nodeText as keyof typeof Opcode];
					break;
				case "LabelRef":
					instr.operands.push({ mode: "label", value: nodeText });
					break;
				case "Instrument":
					instr.operands.push({ mode: "imm", value: Instrument[nodeText as keyof typeof Instrument] });
					break;
				case "Immediate":
					instr.operands.push({ mode: "imm", value: parseInt(nodeText) });
					break;
				case "Register":
					instr.operands.push({ mode: "reg", reg: Register[nodeText as keyof typeof Register] });
					break;
				case "Memory":
					const val = nodeText.slice(1, -1);
					const asNum = parseInt(val);
					if (isNaN(asNum)) instr.operands.push({ mode: "mem_indirect", reg: Register[val as keyof typeof Register] });
					else instr.operands.push({ mode: "mem_direct", address: asNum });
					break;
				default:
					break;
			}
		} while (cursor.next())

		return program;
	}
}
