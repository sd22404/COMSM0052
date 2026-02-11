import { HighlightStyle, LRLanguage, LanguageSupport, syntaxHighlighting } from "@codemirror/language";
import { styleTags, tags } from "@lezer/highlight";
import { parser } from "./parser";

const parserWithHighlighting = parser.configure({
	props: [
		styleTags({
			Comment: tags.lineComment,
			Label: tags.labelName,
			Opcode: tags.keyword,
			Register: tags.variableName,
			Device: tags.typeName,
			Operand: tags.number,
		}),
	],
});

const musicLanguage = LRLanguage.define({ parser: parserWithHighlighting });

const musicHighlightStyle = HighlightStyle.define([
	{ tag: tags.keyword, color: "#2563eb", fontWeight: "600" },
	{ tag: tags.variableName, color: "#16a34a" },
	{ tag: tags.typeName, color: "#d97706" },
	{ tag: tags.number, color: "#9333ea" },
	{ tag: tags.labelName, color: "#0f766e" },
	{ tag: tags.lineComment, color: "#6b7280", fontStyle: "italic" },
]);

export function musiclang() {
	return new LanguageSupport(musicLanguage, [syntaxHighlighting(musicHighlightStyle)]);
}
