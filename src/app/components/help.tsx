import { useState } from "react";
import { createPortal } from "react-dom";

export default function Help() {
	const [showHelp, setShowHelp] = useState(false);

	function HelpModal() {
		return createPortal(
			<div onClick={() => setShowHelp(false)} className="font-mono fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
				<div className="bg-gray-800 p-8 rounded w-3/4 flex flex-col gap-8">
					<div className="flex flex-col gap-2">
						<h1 className="text-[150%]">Controls</h1>
						<span><strong>Ctrl+Enter</strong>: Update code</span>
					</div>
					<div className="flex flex-col gap-2">
						<h1 className="text-[150%]">Syntax</h1>
						<span><strong>"TRACK <em>trackname</em>:"</strong>: Declare a track that executes in parallel with other tracks.</span>
						<span><strong>"<em>label</em>:"</strong>: Declare a label that can be jumped to.</span>
						<span><strong>"JUMP <em>label</em>"</strong>: Jump to the label named <em>label</em>.</span>
						<span><strong>"PLAY <em>instrument note</em>"</strong>: Play a note on an instrument for one beat.</span>
						<span><strong>"REST <em>beats</em>"</strong>: Play nothing for <em>beats</em> beats.</span>
						<span><strong>"SET <em>register value</em>"</strong>: Set the register named <em>register</em> to <em>value</em>.</span>
						<span><strong>"ADD <em>register value</em>"</strong>: Add <em>value</em> to the register named <em>register</em>.</span>
					</div>
				</div>
			</div>,
			document.body
		);
	}

	return (
		<>
			{showHelp && <HelpModal />}
			<div className="flex justify-end">
				<button onClick={() => setShowHelp(!showHelp)} className="p-2 min-w-[100px] rounded bg-blue-500 hover:bg-blue-600 hover:cursor-pointer">
					Help
				</button>
			</div>
		</>
	);
}
