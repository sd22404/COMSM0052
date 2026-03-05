import { basicSetup } from "codemirror";
import { EditorView, Decoration, keymap, KeyBinding } from "@codemirror/view";
import { StateEffect, StateField, Prec } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { musiclang } from "@/language/musiclang";
import { useEffect, useRef } from "react";

const setCursorEffect = StateEffect.define<number>();

const cursorHighlight = StateField.define({
	create() { return Decoration.none; },
	update(_, tr) {
		for (const e of tr.effects) {
			if (!e.is(setCursorEffect)) continue;
			if (e.value < 0 || e.value >= tr.state.doc.lines) continue;
			const line = tr.state.doc.line(e.value + 1);
			return Decoration.set([Decoration.line({ class: "bg-gray-600" }).range(line.from)]);
		}

		return Decoration.none;
	},
	provide: f => EditorView.decorations.from(f),
});

export default function Editor({onCodeChange, cursors}: { onCodeChange?: (code: string) => void, cursors?: number[] }) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onCodeChangeRef = useRef(onCodeChange);
	onCodeChangeRef.current = onCodeChange;

	const runKeymap: KeyBinding = {
		key: "Mod-Enter",
		run: (view) => {
			onCodeChangeRef.current?.(view.state.doc.toString());
			console.log("Run code");
			return true;
		},
	};

	useEffect(() => {
		if (!editorRef.current) return;

		const view = new EditorView({
			doc: "; Ctrl+Enter to apply code updates\n\nSET BPM 120\n\nTRACK one:\nPLAY DRUM KICK\nREST 1\nPLAY DRUM HAT\nREST 1\nPLAY DRUM SNARE\nREST 1\nPLAY DRUM HAT\nREST 1\n\nTRACK two:\nPLAY SYNTH Bb3\nREST 3\n",
			parent: editorRef.current,
			extensions: [
				basicSetup,
				Prec.highest(keymap.of([runKeymap])),
				keymap.of([indentWithTab]),
				musiclang(),
				cursorHighlight,
			],
		});

		viewRef.current = view;
		onCodeChange?.(view.state.doc.toString());
		return () => view.destroy();
	}, []);

	useEffect(() => {
		if (viewRef.current && cursors && cursors.length) {
			viewRef.current.dispatch({ effects: cursors.map(c => setCursorEffect.of(c)) });
		}
	}, [cursors]);

	return (<div className="h-full w-full border-2 rounded" ref={editorRef}/>);
}
