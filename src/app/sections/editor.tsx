import { basicSetup } from "codemirror";
import { RangeSetBuilder, StateEffect, StateField, Text } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, KeyBinding, keymap } from "@codemirror/view";
import { linter } from "@codemirror/lint";
import { indentWithTab } from "@codemirror/commands";
import { catppuccinMocha, catppuccinLatte } from "@catppuccin/codemirror";
import { CodeSpan, RuntimeFault } from "@/common/types";
import { musiclang, musiclinter } from "@/language/musiclang";
import { useEffect, useRef } from "react";

const highlightMark = Decoration.mark({
	class: "cm-highlight",
});

const faultMark = Decoration.mark({
	class: "cm-fault",
});

const setHighlights = StateEffect.define<CodeSpan[]>();
const setFault = StateEffect.define<CodeSpan>();

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function buildDecorations(doc: Text, spans: CodeSpan[], decoration: Decoration): DecorationSet {
	if (doc.length === 0 || spans.length === 0) return Decoration.none;

	const builder = new RangeSetBuilder<Decoration>();
	for (const span of spans) {
		const start = clamp(span.from, 0, doc.length);
		const end = clamp(span.to, 0, doc.length);
		if (end <= start) continue;

		builder.add(start, end, decoration);
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
			if (effect.is(setHighlights))
				nextDecorations = buildDecorations(transaction.state.doc, effect.value, highlightMark);
			if (effect.is(setFault))
				nextDecorations = buildDecorations(transaction.state.doc, [effect.value], faultMark);
		}

		return nextDecorations;
	},
	provide: (field) => EditorView.decorations.from(field),
});

interface EditorProps {
	initialCode: string;
	fault?: RuntimeFault;
	highlights: CodeSpan[];
	onLoad: (code: string) => void;
	onChange: (code: string) => void;
}

export default function Editor({ initialCode, fault, highlights, onLoad, onChange }: EditorProps) {
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
				backgroundColor: ctpAlpha("text", 0.16),
				borderRadius: "2px",
				padding: "0 0 0 2px",
			},
			".cm-fault": {
				backgroundColor: ctpAlpha("red", 0.16),
				borderRadius: "2px",
				padding: "0 0 0 2px",
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
	}, []);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;

		const current = view.state.doc.toString();
		if (current === initialCode) return;

		view.dispatch({
			changes: {
				from: 0,
				to: view.state.doc.length,
				insert: initialCode,
			},
		});
	}, [initialCode]);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;

		view.dispatch({
			effects: setHighlights.of(highlights),
		});
	}, [highlights])
	
	useEffect(() => {
		const view = viewRef.current;
		if (!view || !fault) return;

		view.dispatch({
			effects: setFault.of(fault.span),
		});
	}, [fault]);

	return (
		<div
			ref={editorRef}
			className="min-h-0 min-w-0 flex-1 rounded"
		/>
	);
}
