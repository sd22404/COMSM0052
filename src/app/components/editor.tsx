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
LOAD REG0 0 ; try adding eight to this!
LOAD REG1 3
top:
REST 4
JMPZ REG1 regs
ADD REG0 1
ADD REG1 -1
JUMP top

TRACK synth:
PLAY SYNTH [REG1]
REST 1

TRACK drums:
a:
PLAY DRUMS 0
REST 1
PLAY DRUMS 2
REST 1
PLAY DRUMS 1
REST 1
PLAY DRUMS 2
PLAY DRUMS 2
; JMPZ REG2 b
; JUMP a
PLAY DRUMS 0
REST 1
PLAY DRUMS 2
REST 1
PLAY DRUMS 1
REST 1
PLAY DRUMS 2
REST 1`,
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
