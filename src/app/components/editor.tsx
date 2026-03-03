import { basicSetup } from "codemirror";
import { EditorView, Decoration, keymap } from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";
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

export default function Editor({onCodeChange, cursor}: { onCodeChange?: (code: string) => void, cursor?: number }) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);

	useEffect(() => {
		if (!editorRef.current) return;

		const view = new EditorView({
			doc: "SET BPM 120\nPLAY DRUM KICK\nWAIT 2\nPLAY DRUM HAT\nWAIT 2\nPLAY DRUM SNARE\nWAIT 2\nPLAY DRUM HAT\nWAIT 2",
			parent: editorRef.current,
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				musiclang(),
				cursorHighlight,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) onCodeChange?.(update.state.doc.toString());
				}),
			],
		});

		viewRef.current = view;
		onCodeChange?.(view.state.doc.toString());
		return () => view.destroy();
	}, []);

	useEffect(() => {
		if (viewRef.current && (cursor || cursor == 0)) {
			viewRef.current.dispatch({ effects: setCursorEffect.of(cursor) });
		}
	}, [cursor]);

	return (<div className="h-full w-full border-2 rounded" ref={editorRef}/>);
}
