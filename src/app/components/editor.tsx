import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { musiclang } from "@/language/musiclang";
import { useEffect, useRef } from "react";

export default function Editor({onCodeChange}: { onCodeChange?: (code: string) => void }) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);

	useEffect(() => {
		if (!editorRef.current) return;

		const view = new EditorView({
			doc: "SET BPM 120\nPLAY DRUM KICK\nWAIT 4\n",
			parent: editorRef.current,
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				musiclang(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						if (onCodeChange) onCodeChange(update.state.doc.toString());
					}
				}),
			],
		});

		viewRef.current = view;
		onCodeChange?.(view.state.doc.toString());

		return () => { view.destroy(); };
	}, []);


	return (<div className="h-full w-full border-2 rounded" ref={editorRef}/>);
}
