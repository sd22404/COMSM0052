import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags } from "@lezer/highlight";
import { parser } from "./parser";

const parserWithHighlighting = parser.configure({
	props: [
		styleTags({
			Comment: tags.lineComment,
			Label: tags.labelName,
			Opcode: tags.keyword,
			Register: tags.atom,
			Instrument: tags.typeName,
			Immediate: tags.number,
			Memory: tags.string,
			LabelRef: tags.labelName,
		}),
	],
});

const musicLanguage = LRLanguage.define(
	{
		parser: parserWithHighlighting,
		languageData: {
			commentTokens: { line: ";" },
		},
	}
);

export function musiclang() {
	return new LanguageSupport(musicLanguage);
}
