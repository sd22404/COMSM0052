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
		const decorations: any[] = [];
		for (const e of tr.effects) {
			if (!e.is(setCursorEffect)) continue;
			if (e.value < 1 || e.value > tr.state.doc.lines) continue;
			const line = tr.state.doc.line(e.value);
			decorations.push(Decoration.line({ class: "bg-gray-600" }).range(line.from));
		}

		return decorations.length ? Decoration.set(decorations, true) : Decoration.none;
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
			doc:
`; CTRL + ENTER while typing to update code.

LOAD BPM 120
LOAD VOL 100

TRACK counter:
LOAD REG1 0 ; try setting this to eight!
LOAD REG2 7
loop:
REST 4
JMPZ REG2 counter
ADD REG1 1
ADD REG2 -1
JUMP loop

TRACK synth:
PLAY SYNTH [REG1]
REST 1 ; try adjusting this!

TRACK drums:
PLAY DRUMS 60
REST 1
PLAY DRUMS 62
REST 1
PLAY DRUMS 61
REST 1
PLAY DRUMS 62
PLAY DRUMS 62
PLAY DRUMS 60
REST 1
PLAY DRUMS 62
REST 1
PLAY DRUMS 61
REST 1
PLAY DRUMS 62
REST 1`,
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

	return (<div className="h-full w-full border-2 rounded overflow-scroll" ref={editorRef}/>);
}
