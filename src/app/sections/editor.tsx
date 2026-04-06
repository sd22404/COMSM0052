import { basicSetup } from "codemirror";
// import { Compartment, Range, Text } from "@codemirror/state";
// import { EditorView, Decoration, DecorationSet, KeyBinding, keymap } from "@codemirror/view";
import { Compartment, Text } from "@codemirror/state";
import { EditorView, KeyBinding, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { catppuccinMocha, catppuccinLatte } from "@catppuccin/codemirror";
import { musiclang } from "@/language/musiclang";
import { useEffect, useRef } from "react";

interface EditorProps {
	initialCode: string;
	onCodeChange?: (code: string) => void;
}

// function clampChar(doc: Text, value: number) {
// 	return Math.max(0, Math.min(doc.length, value));
// }

// function getLineStart(doc: Text, lineNumber: number) {
// 	if (lineNumber < 1 || lineNumber > doc.lines) return null;
// 	return doc.line(lineNumber).from;
// }

// function buildHighlights(
// 	doc: Text,
// 	execHighlight: LineSpan | null,
// 	musicHighlights: MusicHighlight[],
// ): DecorationSet {
// 	const decs: Range<Decoration>[] = [];
// 	const lineClasses = new Map<number, Set<string>>();

// 	const addLineClass = (lineNumber: number, className: string) => {
// 		const classes = lineClasses.get(lineNumber) ?? new Set<string>();
// 		classes.add(className);
// 		lineClasses.set(lineNumber, classes);
// 	};

// 	const addRangeClass = (span: LineSpan, className: string) => {
// 		const from = clampChar(doc, span.from);
// 		const to = clampChar(doc, span.to);
// 		if (to <= from) return;
// 		decs.push(Decoration.mark({ class: className }).range(from, to));
// 	};

// 	if (execHighlight) {
// 		addLineClass(execHighlight.line, "cm-runtime-execution-line");
// 		addRangeClass(execHighlight, "cm-runtime-execution-span");
// 	}

// 	for (const highlight of musicHighlights) {
// 		const lineClass = highlight.type === "rest"
// 			? "cm-runtime-musical-rest-line"
// 			: "cm-runtime-musical-play-line";
// 		const spanClass = highlight.type === "rest"
// 			? "cm-runtime-musical-rest-span"
// 			: "cm-runtime-musical-play-span";

// 		addLineClass(highlight.lineSpan.line, lineClass);
// 		addRangeClass(highlight.lineSpan, spanClass);
// 	}

// 	for (const [lineNumber, classes] of lineClasses.entries()) {
// 		const lineStart = getLineStart(doc, lineNumber);
// 		if (lineStart === null) continue;
// 		decs.push(Decoration.line({
// 			attributes: {
// 				class: [...classes].join(" "),
// 			},
// 		}).range(lineStart));
// 	}

// 	return decs.length > 0 ? Decoration.set(decs, true) : Decoration.none;
// }

export default function Editor({
	initialCode,
	onCodeChange,
}: EditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const highlightRef = useRef(new Compartment());
	const doc = Text.of(initialCode.split("\n"));

	const loadCode = () => {
		const view = viewRef.current;
		if (!view) return;
		onCodeChange?.(view.state.doc.toString());
	};

	useEffect(() => {
		if (!editorRef.current) return;

		const runKeymap: KeyBinding = {
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
			".cm-activeLineGutter": {
				color: ctp("lavender"),
			},
			".cm-runtime-execution-line": {
				backgroundColor: ctpAlpha("blue", 0.12),
			},
			".cm-runtime-execution-span": {
				backgroundColor: ctpAlpha("blue", 0.24),
				borderBottom: `1px solid ${ctpAlpha("mauve", 0.55)}`,
				borderRadius: "3px",
			},
			".cm-runtime-musical-play-line": {
				backgroundColor: ctpAlpha("peach", 0.1),
			},
			".cm-runtime-musical-play-span": {
				backgroundColor: ctpAlpha("green", 0.22),
				borderBottom: `1px solid ${ctpAlpha("green", 0.5)}`,
				borderRadius: "3px",
			},
			".cm-runtime-musical-rest-line": {
				backgroundColor: ctpAlpha("red", 0.1),
			},
			".cm-runtime-musical-rest-span": {
				backgroundColor: ctpAlpha("yellow", 0.18),
				borderBottom: `1px solid ${ctpAlpha("yellow", 0.45)}`,
				borderRadius: "3px",
			},
		});

		// const highlight = highlightRef.current;
		const view = new EditorView({
			doc: doc,
			parent: editorRef.current,
			extensions: [
				keymap.of([runKeymap]),
				keymap.of([indentWithTab]),
				// highlight.of(EditorView.decorations.of(
				// 	buildHighlights(doc, null, []),
				// )),
				style,
				theme,
				basicSetup,
				musiclang(),
			],
		});

		viewRef.current = view;
		loadCode();

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, [initialCode]);

	// useEffect(() => {
	// 	const view = viewRef.current;
	// 	if (!view) return;

	// 	view.dispatch({
	// 		effects: highlightRef.current.reconfigure(
	// 			EditorView.decorations.of(
	// 				buildHighlights(view.state.doc, execHighlight, musicHighlights),
	// 			),
	// 		),
	// 	});
	// }, [execHighlight, musicHighlights]);

	return (
		<div
			ref={editorRef}
			className="min-h-0 min-w-0 flex-1 rounded"
		/>
	);
}
