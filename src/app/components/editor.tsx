import { basicSetup } from "codemirror";
import { EditorView, keymap, KeyBinding } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { musiclang } from "@/language/musiclang";
import { useEffect, useRef } from "react";

export default function Editor({onCodeChange}: { onCodeChange?: (code: string) => void }) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onCodeChangeRef = useRef(onCodeChange);
	onCodeChangeRef.current = onCodeChange;

	const runKeymap: KeyBinding = {
		key: "Mod-Enter",
		run: (view) => {
			onCodeChangeRef.current?.(view.state.doc.toString());
			return true;
		},
	};

	useEffect(() => {
		if (!editorRef.current) return;

		const view = new EditorView({
			doc:
`; CTRL + ENTER while typing to update code.

LOAD BPM 120
LOAD VOL 20

TRACK regs:
LOAD REG1 0 ; try adding eight to this!
LOAD REG2 3
top:
REST 4
BRZ REG2 regs
ADD REG1 1
ADD REG2 -1
JUMP top

TRACK synth:
PLAY SYNTH [REG1]
REST 2

TRACK drums:
a:
PLAY DRUM 0
REST 2
PLAY DRUM 2
REST 2
PLAY DRUM 1
REST 2
PLAY DRUM 2
REST 1
PLAY DRUM 2
REST 1
; BRZ REG2 b
; JUMP a
PLAY DRUM 0
REST 2
PLAY DRUM 2
REST 2
PLAY DRUM 1
REST 2
PLAY DRUM 2
REST 2`,
			parent: editorRef.current,
			extensions: [
				basicSetup,
				Prec.highest(keymap.of([runKeymap])),
				keymap.of([indentWithTab]),
				musiclang(),
			],
		});

		viewRef.current = view;
		onCodeChange?.(view.state.doc.toString());
		return () => view.destroy();
	}, []);

	return (<div className="h-full w-full border-2 rounded overflow-scroll" ref={editorRef}/>);
}
