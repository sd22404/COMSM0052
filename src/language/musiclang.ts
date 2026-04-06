import { EditorView } from "codemirror";
import { Diagnostic } from "@codemirror/lint";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { CompletionContext } from "@codemirror/autocomplete";
import { styleTags, tags } from "@lezer/highlight";
import { parser } from "./parser";
import { Opcode, Register, Instrument } from "@/common/types";

const parserWithHighlighting = parser.configure({
	props: [
		styleTags({
			Comment: tags.lineComment,
			Label: tags.labelName,
			Opcode: tags.keyword,
			Register: tags.operator,
			Instrument: tags.typeName,
			Immediate: tags.number,
			Memory: tags.string,
			LabelRef: tags.labelName,
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
	const instruments = createOptions(Instrument, "type");
	
	if (["JUMP"].includes(prevWord)) options = [];
	else if (["PLAY"].includes(prevWord)) options = instruments;
	else if (["LOAD", "ADD"].includes(prevWord)) options = allRegs;
	else if (["JMPZ", "REST", "STORE"].includes(prevWord)) options = regs;
	else if (regs.map(reg => reg.label).includes(prevWord)) options = regs;
	else if (instruments.map(i => i.label).includes(prevWord)) options = regs;

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
	const diagnostics: Diagnostic[] = [];

	syntaxTree(view.state).cursor().iterate(node => {
		if (node.type.isError) {
			diagnostics.push({
				from: node.from,
				to: node.to,
				severity: "error",
				message: "Yep. That's a syntax error.",
			});
		}},
	);

	return diagnostics;
}
