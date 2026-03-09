import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Help() {
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				setShowHelp(false);
			}
		}
		
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	function HelpModal() {
		return createPortal(
			<div onClick={() => setShowHelp(false)} className="font-mono fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
				<div className="bg-gray-800 p-8 rounded max-w-3/4 max-h-3/4 overflow-scroll flex flex-col gap-8" onClick={(e) => e.stopPropagation()}>
					<div className="flex flex-col gap-2">
						<h1 className="text-[150%]">Controls</h1>
						<span><strong>Ctrl+Enter</strong>: Update code.</span>
						<span><strong>Escape</strong>: Close this popup.</span>
					</div>
					<div className="flex flex-col gap-2">
						<h1 className="text-[150%]">Instruments</h1>
						<span><strong>DRUM</strong>: A drum machine with kick, snare, and hat sounds.</span>
						<span><strong>SYNTH</strong>: A synthesizer that can play chromatic notes across multiple octaves.</span>
					</div>
					<div className="flex flex-col gap-2">
						<h1 className="text-[150%]">Syntax</h1>
						<span><strong>"TRACK <em>trackname</em>:"</strong>: Declare a track that executes in parallel with other tracks.</span>
						<span><strong>"PLAY <em>instrument note</em>"</strong>: Play <em>note</em> on <em>instrument</em> for one beat.</span>
						<span><strong>"PLAY <em>instrument number</em>"</strong>: Play the note at memory address <em>number</em> on <em>instrument</em>.</span>
						<span><strong>"REST <em>number</em>"</strong>: Play nothing for <em>number</em> beats.</span>
						<span><strong>"SET <em>register value</em>"</strong>: Set the register named <em>register</em> to <em>value</em>.</span>
						<span><strong>"ADD <em>register value</em>"</strong>: Add <em>value</em> to the register named <em>register</em>.</span>
						<span><strong>"<em>label</em>:"</strong>: Declare a label that can be jumped to.</span>
						<span><strong>"JUMP <em>label</em>"</strong>: Jump to the label named <em>label</em>.</span>
						<span><strong>"BRZ <em>register</em> <em>label</em>"</strong>: Jump to <em>label</em> if <em>register</em> is zero.</span>
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
