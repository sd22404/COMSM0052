import { basicSetup } from "codemirror";
import { RangeSetBuilder, StateEffect, StateField, Text } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, KeyBinding, keymap } from "@codemirror/view";
import { linter } from "@codemirror/lint";
import { indentWithTab } from "@codemirror/commands";
import { catppuccinMocha, catppuccinLatte } from "@catppuccin/codemirror";
import { CodeRange } from "@/common/types";
import { musiclang, musiclinter } from "@/language/musiclang";
import { useEffect, useRef } from "react";

const highlightLine = Decoration.line({
	class: "cm-highlight",
});

const setHighlights = StateEffect.define<CodeRange[]>();

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function buildDecorations(doc: Text, ranges: CodeRange[]): DecorationSet {
	if (doc.length === 0 || ranges.length === 0) return Decoration.none;

	const builder = new RangeSetBuilder<Decoration>();
	const seen = new Set<number>();

	for (const range of ranges) {
		const start = clamp(range.from, 0, doc.length);
		const end = clamp(Math.max(range.from, range.to - 1), 0, doc.length);
		let line = doc.lineAt(start);
		const finalLine = doc.lineAt(end);

		while (true) {
			if (!seen.has(line.from)) {
				seen.add(line.from);
				builder.add(line.from, line.from, highlightLine);
			}

			if (line.number >= finalLine.number || line.number >= doc.lines) break;
			line = doc.line(line.number + 1);
		}
	}

	return builder.finish();
}

const highlightField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(decorations, transaction) {
		let nextDecorations = decorations.map(transaction.changes);

		for (const effect of transaction.effects) {
			if (!effect.is(setHighlights)) continue;
			nextDecorations = buildDecorations(transaction.state.doc, effect.value);
		}

		return nextDecorations;
	},
	provide: (field) => EditorView.decorations.from(field),
});

interface EditorProps {
	initialCode: string;
	highlights: CodeRange[];
	onLoad: (code: string) => void;
	onChange: (code: string) => void;
}

export default function Editor({ initialCode, highlights, onLoad, onChange }: EditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onLoadRef = useRef(onLoad);
	const onChangeRef = useRef(onChange);

	useEffect(() => {
		onLoadRef.current = onLoad;
	}, [onLoad]);

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		if (!editorRef.current) return;

		const loadCode = () => {
			const view = viewRef.current;
			if (!view) return;
			onLoadRef.current?.(view.state.doc.toString());
		};

		const loadKeybind: KeyBinding = {
			key: "Mod-Enter",
			run: () => {
				loadCode();
				return true;
			},
		};

		const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
		const flavour = prefersLight ? "latte" : "mocha";
		const theme = prefersLight ? catppuccinLatte : catppuccinMocha;
		const ctp = (colour: string) => `var(--ctp-${flavour}-${colour})`;
		const ctpAlpha = (colour: string, opacity: number) => `rgb(var(--ctp-${flavour}-${colour}-rgb) / ${opacity})`;

		const style = EditorView.theme({
			"&": {
				height: "100%",
			},
			".cm-scroller": {
				fontFamily: "var(--font-mono)",
			},
			".cm-highlight": {
				backgroundColor: ctpAlpha("teal", 0.16),
			},
			".cm-activeLineGutter": {
				color: ctp("lavender"),
			},
		});

		const view = new EditorView({
			doc: initialCode,
			parent: editorRef.current,
			extensions: [
				keymap.of([loadKeybind]),
				keymap.of([indentWithTab]),
				EditorView.updateListener.of((update) => {
					if (!update.docChanged) return;
					onChangeRef.current?.(update.state.doc.toString());
				}),
				style,
				theme,
				basicSetup,
				highlightField,
				musiclang(),
				linter(musiclinter),
			],
		});

		viewRef.current = view;

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, [initialCode]);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;

		view.dispatch({
			effects: setHighlights.of(highlights),
		});
	}, [highlights]);

	return (
		<div
			ref={editorRef}
			className="min-h-0 min-w-0 flex-1 rounded"
		/>
	);
}
