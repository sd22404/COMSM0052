import {
	CodeSpan, CompileResult, Diagnostic, hasErrors, Register, Device, Program,
	Opcode, OpType, ValOperand, RegOperand, ImmOperand, MemOperand, DeviceOperand, AddrOperand, LabelOperand,
	Instruction,
} from "@/common/types";
import { parser } from "./parser";

type RawOpType = "Immediate" | "Register" | "Memory" | "Device" | "Identifier";

interface RawOperand {
	type: RawOpType;
	text: string;
	span: CodeSpan;
	addr?: RawOperand;
}

interface RawInstruction {
	opcodeText?: string;
	opcodeSpan: CodeSpan;
	operands: RawOperand[];
	span: CodeSpan;
}

interface RawLabel {
	name: string;
	addr: number;
	span: CodeSpan;
}

function diagnostic(message: string, span: CodeSpan): Diagnostic {
	return { severity: "error", message, span };
}

function span(from: number, to: number): CodeSpan {
	return { from, to };
}

function parseOpcode(text: string): Opcode | undefined {
	return Opcode[text as keyof typeof Opcode];
}

function parseImmediate(text: string): number | undefined {
	const value = parseInt(text);
	return isNaN(value) ? undefined : value;
}

function parseRegister(text: string): Register | undefined {
	return Register[text as keyof typeof Register];
}

function parseDevice(text: string): Device | undefined {
	return Device[text as keyof typeof Device];
}

function parseImmOperand(raw: RawOperand, diagnostics: Diagnostic[]): ImmOperand | undefined {
	if (raw.type !== "Immediate") {
		diagnostics.push(diagnostic("expected a number.", raw.span));
		return undefined;
	}
	const value = parseImmediate(raw.text);
	if (value === undefined) {
		diagnostics.push(diagnostic(`invalid immediate value "${raw.text}".`, raw.span));
		return undefined;
	}
	return { type: OpType.Imm, value, span: raw.span };
}

function parseRegOperand(raw: RawOperand, diagnostics: Diagnostic[]): RegOperand | undefined {
	if (raw.type !== "Register") {
		diagnostics.push(diagnostic("expected a register.", raw.span));
		return undefined;
	}
	const reg = parseRegister(raw.text);
	if (reg === undefined) {
		diagnostics.push(diagnostic(`invalid register "${raw.text}".`, raw.span));
		return undefined;
	}

	return { type: OpType.Reg, reg, span: raw.span };
}

function parseAddrOperand(raw: RawOperand, diagnostics: Diagnostic[]): AddrOperand | undefined {
	if (raw.type == "Immediate") return parseImmOperand(raw, diagnostics);
	if (raw.type == "Register") return parseRegOperand(raw, diagnostics);

	diagnostics.push(diagnostic("expected a memory address (number or register).", raw.span));
	return undefined;
}

function parseMemOperand(raw: RawOperand, diagnostics: Diagnostic[]): MemOperand | undefined {
	if (raw.type !== "Memory") {
		diagnostics.push(diagnostic("expected a memory operand.", raw.span));
		return undefined;
	}

	const addr = raw.addr;
	if (!addr) {
		diagnostics.push(diagnostic("memory operand missing address.", raw.span));
		return undefined;
	}

	const addrOp = parseAddrOperand(addr, diagnostics);
	if (!addrOp) {
		diagnostics.push(diagnostic("invalid memory address.", raw.span));
		return undefined;
	}

	return { type: OpType.Mem, addr: addrOp, span: raw.span };
}

function parseDeviceOperand(raw: RawOperand, diagnostics: Diagnostic[]): DeviceOperand | undefined {
	if (raw.type !== "Device") {
		diagnostics.push(diagnostic("expected a device operand.", raw.span));
		return undefined;
	}
	const device = parseDevice(raw.text);
	if (device === undefined) {
		diagnostics.push(diagnostic(`invalid device "${raw.text}".`, raw.span));
		return undefined;
	}
	return { type: OpType.Device, device, span: raw.span };
}

function parseLabelOperand(raw: RawOperand, labels: Record<string, number>, diagnostics: Diagnostic[]): LabelOperand | undefined {
	if (raw.type === "Immediate") {
		const addr = parseImmediate(raw.text);
		if (addr === undefined) {
			diagnostics.push(diagnostic(`invalid target "${raw.text}".`, raw.span));
			return undefined;
		}
		return { type: OpType.Label, addr, label: raw.text, span: raw.span };
	}

	if (raw.type === "Identifier") {
		const addr = labels[raw.text];
		if (addr === undefined) {
			diagnostics.push(diagnostic(`label "${raw.text}" not found.`, raw.span));
			return undefined;
		}
		return { type: OpType.Label, addr, label: raw.text, span: raw.span };
	}

	diagnostics.push(diagnostic("expected a label.", raw.span));
	return undefined;
}

function parseValOperand(raw: RawOperand, diagnostics: Diagnostic[]): ValOperand | undefined {
	if (raw.type === "Immediate") return parseImmOperand(raw, diagnostics);
	if (raw.type === "Register") return parseRegOperand(raw, diagnostics);
	if (raw.type === "Memory") return parseMemOperand(raw, diagnostics);

	diagnostics.push(diagnostic("expected a value (number, register, or memory address).", raw.span));
	return undefined;
}

function requireArity(raw: RawInstruction, expected: number, diagnostics: Diagnostic[]): boolean {
	if (raw.operands.length === expected) return true;

	const name = raw.opcodeText ?? "UNKNOWN";
	diagnostics.push(
		diagnostic(
			`${name} expects ${expected} operand${expected === 1 ? "" : "s"}.`,
			raw.span,
		)
	);
	return false;
}

function requireArityRange(raw: RawInstruction, min: number, max: number, diagnostics: Diagnostic[]): boolean {
	if (raw.operands.length >= min && raw.operands.length <= max) return true;

	const name = raw.opcodeText ?? "UNKNOWN";
	diagnostics.push(diagnostic(`${name} expects ${min} or ${max} operands.`, raw.span));
	return false;
}

function buildRaw(code: string) {
	const tree = parser.parse(code);
	const cursor = tree.cursor();

	const instrs: RawInstruction[] = [];
	const labels: RawLabel[] = [];
	let current: RawInstruction | undefined;

	do {
		const nodeName = cursor.node.type.name;
		const nodeText = code.slice(cursor.from, cursor.to);
		const nodeSpan = span(cursor.from, cursor.to);

		switch (nodeName) {
			case "Instruction":
				current = {
					opcodeSpan: nodeSpan,
					operands: [],
					span: nodeSpan,
				};
				instrs.push(current);
				break;

			case "Label":
				labels.push({
					name: nodeText.slice(0, -1),
					addr: instrs.length,
					span: nodeSpan,
				});
				break;

			case "Opcode":
				if (current) {
					current.opcodeText = nodeText;
					current.opcodeSpan = nodeSpan;
				}
				break;
			case "Device":
			case "Immediate":
			case "Register":
			case "Memory":
			case "Identifier": {
				const parent = cursor.node.parent?.type.name;
				if (parent === "Memory") {
					const last = current?.operands.at(-1);
					if (last?.type === "Memory" && !last.addr) {
						last.addr = {
							type: nodeName as "Immediate" | "Register",
							text: nodeText,
							span: nodeSpan,
						};
					}
					break;
				}

				if (parent !== "Operand") break;
				current?.operands.push({
					type: nodeName as RawOpType | "Memory",
					text: nodeText,
					span: nodeSpan,
				});
				break;
			}
		}
	} while (cursor.next());

	return { instrs, labels };
}

function buildLabels(labels: RawLabel[], diagnostics: Diagnostic[]) {
	const table: Record<string, number> = {};

	for (const label of labels) {
		if (Object.hasOwn(table, label.name)) {
			diagnostics.push(diagnostic(`duplicate label "${label.name}".`, label.span));
			continue;
		}
		table[label.name] = label.addr;
	}

	return table;
}

function buildInstruction(raw: RawInstruction, labels: Record<string, number>, diagnostics: Diagnostic[]): Instruction | undefined {
	const opcodeText = raw.opcodeText;
	if (!opcodeText) {
		diagnostics.push(diagnostic("missing opcode.", raw.opcodeSpan));
		return undefined;
	}

	const opcode = parseOpcode(opcodeText);
	if (opcode === undefined) {
		diagnostics.push(diagnostic(`unknown opcode "${opcodeText}".`, raw.opcodeSpan));
		return undefined;
	}

	switch (opcode) {
		case Opcode.PLAY: {
			if (!requireArityRange(raw, 2, 3, diagnostics)) return undefined;
			const device = parseDeviceOperand(raw.operands[0], diagnostics);
			const pitch = parseValOperand(raw.operands[1], diagnostics);
			const durationRaw = raw.operands[2];
			const duration = durationRaw
				? parseValOperand(durationRaw, diagnostics)
				: undefined;
			if (!device || !pitch || (durationRaw && !duration)) return undefined;

			return { opcode, operands: duration ? [device, pitch, duration] : [device, pitch], span: raw.span };
		}

		case Opcode.REST: {
			if (!requireArity(raw, 1, diagnostics)) return undefined;
			const ticks = parseValOperand(raw.operands[0], diagnostics);
			if (!ticks) return undefined;

			return { opcode, operands: [ticks], span: raw.span };
		}

		case Opcode.LOAD: {
			if (!requireArity(raw, 2, diagnostics)) return undefined;
			const dest = parseRegOperand(raw.operands[0], diagnostics);
			const value = parseValOperand(raw.operands[1], diagnostics);
			if (!dest || !value) return undefined;

			return { opcode, operands: [dest, value], span: raw.span };
		}

		case Opcode.STORE: {
			if (!requireArity(raw, 2, diagnostics)) return undefined;
			const addr = parseAddrOperand(raw.operands[0], diagnostics);
			const value = parseValOperand(raw.operands[1], diagnostics);
			if (!addr || !value) return undefined;

			return { opcode, operands: [addr, value], span: raw.span };
		}

		case Opcode.ADD: {
			if (!requireArity(raw, 2, diagnostics)) return undefined;
			const dest = parseRegOperand(raw.operands[0], diagnostics);
			const value = parseValOperand(raw.operands[1], diagnostics);
			if (!dest || !value) return undefined;

			return { opcode, operands: [dest, value], span: raw.span };
		}

		case Opcode.JUMP: {
			if (!requireArity(raw, 1, diagnostics)) return undefined;
			const target = parseLabelOperand(raw.operands[0], labels, diagnostics);
			if (!target) return undefined;

			return { opcode, operands: [target], span: raw.span };
		}

		case Opcode.JMPZ: {
			if (!requireArity(raw, 2, diagnostics)) return undefined;
			const test = parseRegOperand(raw.operands[0], diagnostics);
			const target = parseLabelOperand(raw.operands[1], labels, diagnostics);
			if (!test || !target) return undefined;

			return { opcode, operands: [test, target], span: raw.span };
		}
	}
}

function parse(code: string): Diagnostic[] {
	const tree = parser.parse(code);
	const diagnostics: Diagnostic[] = [];

	tree.cursor().iterate((node) => {
		if (!node.type.isError) return;

		const from = node.from;
		const to = Math.max(Math.min(code.length, node.from + 1), node.to);
		diagnostics.push(diagnostic("syntax error.", span(from, to)));
	});

	return diagnostics;
}

export class Compiler {
	static compile(code: string): CompileResult {
		const parseDiagnostics = parse(code);
		if (hasErrors(parseDiagnostics)) return { diagnostics: parseDiagnostics };

		const diagnostics: Diagnostic[] = [];
		const { instrs: rawInstrs, labels: rawLabels } = buildRaw(code);
		const labels = buildLabels(rawLabels, diagnostics);

		const program: Program = [];
		for (const raw of rawInstrs) {
			const instr = buildInstruction(raw, labels, diagnostics);
			if (instr) program.push(instr);
		}

		if (hasErrors(diagnostics)) return { diagnostics };
		return { program, diagnostics };
	}
}
