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
			Instrument: tags.typeName,
			Note: tags.string,
			Number: tags.number,
			Identifier: tags.name,
		}),
	],
});

const musicLanguage = LRLanguage.define({ parser: parserWithHighlighting });

const musicHighlightStyle = HighlightStyle.define([
	{ tag: tags.keyword, color: "#c678dd", fontWeight: "600" },
	{ tag: tags.variableName, color: "#e06c75" },
	{ tag: tags.typeName, color: "#e5c07b" },
	{ tag: tags.string, color: "#98c379" },
	{ tag: tags.number, color: "#d19a66" },
	{ tag: tags.name, color: "#61afef" },
	{ tag: tags.labelName, color: "#56b6c2", fontWeight: "600" },
	{ tag: tags.lineComment, color: "#5c6370", fontStyle: "italic" },
]);

export function musiclang() {
	return new LanguageSupport(musicLanguage, [syntaxHighlighting(musicHighlightStyle)]);
}
