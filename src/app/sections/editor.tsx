import { basicSetup } from "codemirror";
import { Text } from "@codemirror/state";
import { EditorView, KeyBinding, keymap } from "@codemirror/view";
import { linter } from "@codemirror/lint";
import { indentWithTab } from "@codemirror/commands";
import { catppuccinMocha, catppuccinLatte } from "@catppuccin/codemirror";
import { musiclang, musiclinter } from "@/language/musiclang";
import { useEffect, useRef } from "react";

interface EditorProps {
	initialCode: string;
	onCodeChange?: (code: string) => void;
	onDraftChange?: (code: string) => void;
}

export default function Editor({
	initialCode,
	onCodeChange,
	onDraftChange,
}: EditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onCodeChangeRef = useRef(onCodeChange);
	const onDraftChangeRef = useRef(onDraftChange);

	useEffect(() => {
		onCodeChangeRef.current = onCodeChange;
	}, [onCodeChange]);

	useEffect(() => {
		onDraftChangeRef.current = onDraftChange;
	}, [onDraftChange]);

	useEffect(() => {
		if (!editorRef.current) return;
		const doc = Text.of(initialCode.split("\n"));

		const loadCode = () => {
			const view = viewRef.current;
			if (!view) return;
			onCodeChangeRef.current?.(view.state.doc.toString());
		};

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
		});

		const view = new EditorView({
			doc: doc,
			parent: editorRef.current,
			extensions: [
				keymap.of([runKeymap]),
				keymap.of([indentWithTab]),
				EditorView.updateListener.of((update) => {
					if (!update.docChanged) return;
					onDraftChangeRef.current?.(update.state.doc.toString());
				}),
				style,
				theme,
				basicSetup,
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

	return (
		<div
			ref={editorRef}
			className="min-h-0 min-w-0 flex-1 rounded"
		/>
	);
}
