import { parser } from "./parser";
import { Program, Instruction, Opcode, Register, Instrument } from "@/common/types";

export class Assembler {
	static assemble(code: string) {
		const tree = parser.parse(code);
		const cursor = tree.cursor();
		const program: Program = { instrs: [], labels: {} };
		let instr: Instruction | null = null;

		do {
			const nodeText = code.slice(cursor.from, cursor.to);

			switch (cursor.node.type.name) {
				case "Instruction":
					instr = {
						opcode: Opcode.NOP,
						operands: [],
						range: {
							from: cursor.from,
							to: cursor.to,
						},
					};
					program.instrs.push(instr);
					break;
				case "Label":
					program.labels[nodeText.split(":").at(0)!] = program.instrs.length;
					break;
				case "Opcode":
					if (instr) {
						instr.opcode = Opcode[nodeText as keyof typeof Opcode] ?? Opcode.NOP;
					}
					break;
				case "LabelRef":
					instr?.operands.push({ mode: "label", value: nodeText });
					break;
				case "Instrument":
					instr?.operands.push({ mode: "instrument", value: Instrument[nodeText as keyof typeof Instrument] });
					break;
				case "Immediate":
					instr?.operands.push({ mode: "imm", value: parseInt(nodeText) }); // TODO: handle erroneous input
					break;
				case "Register":
					if (instr && instr.operands.length === 0 && [Opcode.LOAD, Opcode.ADD].includes(instr.opcode))
						instr.operands.push({ mode: "reg_write", reg: Register[nodeText as keyof typeof Register] });
					else
						instr?.operands.push({ mode: "reg_read", reg: Register[nodeText as keyof typeof Register] });
					break;
				case "Memory": {
					const value = nodeText.slice(1, -1);
					const asInt = parseInt(value);
					if (isNaN(asInt)) {
						instr?.operands.push({ mode: "mem_indirect", reg: Register[value as keyof typeof Register] });
					} else {
						instr?.operands.push({ mode: "mem_direct", address: asInt });
					}
					break;
				}
				default:
					break;
			}
		} while (cursor.next());

		return program;
	}
}
