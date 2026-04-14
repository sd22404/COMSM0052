import { EditorView } from "codemirror";
import { Diagnostic } from "@codemirror/lint";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { CompletionContext } from "@codemirror/autocomplete";
import { styleTags, tags } from "@lezer/highlight";
import { parser } from "./parser";
import { Compiler } from "./compiler";
import { Opcode, Register, Device } from "@/common/types";

const parserWithHighlighting = parser.configure({
	props: [
		styleTags({
			Comment: tags.lineComment,
			Label: tags.labelName,
			Opcode: tags.keyword,
			Immediate: tags.number,
			Register: tags.operator,
			Memory: tags.string,
			Device: tags.typeName,
			Identifier: tags.labelName,
		}),
	],
});

function createOptions(obj: object, type: string = "keyword") {
	const enumKeys = (enumObj: object) =>
		Object.keys(enumObj).filter(key => isNaN(Number(key)));

	return enumKeys(obj).map(
		key => ({ label: key, type: type }),
	);
}

function completions(context: CompletionContext) {
	const word = context.matchBefore(/\w*/);
	const from = word?.from ?? context.pos;
	const lineFrom = context.state.doc.lineAt(context.pos).from;

	let prevPos = from;
	while (prevPos-- > lineFrom) {
		const char = context.state.sliceDoc(prevPos, prevPos + 1);
		if (char != " " && char != "\t") break;
	}

	const node = syntaxTree(context.state).resolveInner(prevPos, -1);
	const prevWord = context.state.sliceDoc(node.from, node.to);

	let options = createOptions(Opcode, "keyword");

	const regs = createOptions(Register, "type").filter(reg => reg.label.includes("REG") || reg.label === "RAND")
	const allRegs = createOptions(Register, "type");
	const devices = createOptions(Device, "type");
	
	if (["JUMP"].includes(prevWord)) options = [];
	else if (["PLAY"].includes(prevWord)) options = devices;
	else if (["LOAD", "ADD"].includes(prevWord)) options = allRegs;
	else if (["JMPZ", "REST", "STORE"].includes(prevWord)) options = regs;
	else if (allRegs.map(reg => reg.label).includes(prevWord)) options = regs;
	else if (devices.map(d => d.label).includes(prevWord)) options = regs;

	return {
		from,
		options,
	}
}

const musicLanguage = LRLanguage.define(
	{
		parser: parserWithHighlighting,
		languageData: {
			commentTokens: { line: ";" },
			autocomplete: completions,
		},
	}
);

export function musiclang() {
	return new LanguageSupport(musicLanguage);
}

export function musiclinter(view: EditorView): readonly Diagnostic[] {
	return Compiler.compile(view.state.doc.toString()).diagnostics.map((diagnostic) => ({
			from: diagnostic.span.from,
			to: diagnostic.span.to,
			severity: diagnostic.severity,
			message: diagnostic.message,
		}));
}
