import { basicSetup } from "codemirror";
import { EditorView, KeyBinding, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { Prec } from "@codemirror/state";
import { catppuccinMocha, catppuccinLatte } from "@catppuccin/codemirror";
import { musiclang } from "@/language/musiclang";
import { useEffect, useRef } from "react";

interface EditorProps {
	initialCode: string;
	onCodeChange?: (code: string) => void;
	loadTrigger: boolean;
}

export default function Editor({ initialCode, onCodeChange, loadTrigger }: EditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onCodeChangeRef = useRef(onCodeChange);

	useEffect(() => {
		onCodeChangeRef.current = onCodeChange;
	}, [onCodeChange]);

	useEffect(() => {
		if (!editorRef.current) return;

		const loadEditorCode = () => {
			const view = viewRef.current;
			if (!view) return;
			onCodeChangeRef.current?.(view.state.doc.toString());
		};

		const runKeymap: KeyBinding = {
			key: "Mod-Enter",
			run: () => {
				loadEditorCode();
				return true;
			},
		};

		const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
			? catppuccinLatte
			: catppuccinMocha;

		const style = EditorView.theme({
			"&": {
				height: "100%",
			},
			".cm-editor": {
				height: "100%",
				overflow: "auto",
			},
			".cm-scroller": {
				fontFamily: "var(--font-mono)",
			},
		})

		const view = new EditorView({
			doc: initialCode,
			parent: editorRef.current,
			extensions: [
				basicSetup,
				Prec.highest(keymap.of([runKeymap])),
				keymap.of([indentWithTab]),
				style,
				theme,
				musiclang(),
			],
		});

		viewRef.current = view;
		onCodeChangeRef.current?.(view.state.doc.toString());

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, [initialCode]);

	useEffect(() => {
		onCodeChangeRef.current?.(viewRef.current?.state.doc.toString() ?? initialCode);
	}, [initialCode, loadTrigger]);

	return (
		<div
			ref={editorRef}
			className="min-h-0 flex-1 rounded overflow-y-auto"
		/>
	);
}
