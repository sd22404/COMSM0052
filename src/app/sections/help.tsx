import Button from "@/app/components/button";
import Card from "@/app/components/card";
import { SectionTitle } from "@/app/components/text";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

function HelpBlock({ title, lines }: { title: string; lines: ReactNode[] }) {
	return (
		<div className="flex flex-col gap-2">
			<SectionTitle className="text-[150%]">{title}</SectionTitle>
			{lines.map((line, index) => (
				<span key={`${title}-${index}`} className="text-ctp-subtext0">{line}</span>
			))}
		</div>
	);
}

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	if (!open) return null;

	return createPortal(
		<div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-ctp-crust/70 font-mono backdrop-blur-sm">
			<Card
				variant="panel"
				className="flex max-h-[80vh] w-[min(840px,calc(100vw-2rem))] flex-col gap-8 overflow-y-auto p-8"
				onClick={(event) => event.stopPropagation()}
			>
				<HelpBlock
					title="Controls"
					lines={[
						<><strong>Ctrl+Enter</strong>: Load the focused editor into its matching core.</>,
						<><strong>Enable Core</strong>: Arm that core so it participates when the runtime is running.</>,
						<><strong>Global BPM</strong> and <strong>VOL</strong>: Shared transport controls that every core scales with its own BPM % and VOL % registers.</>,
						<><strong>Escape</strong>: Close this popup.</>,
					]}
				/>
				<HelpBlock
					title="Registers"
					lines={[
						<><strong>BPM %</strong> and <strong>VOL %</strong> scale the shared global BPM and VOL for each core.</>,
						<><strong>PAN</strong> controls stereo position per core.</>,
						<><strong>ATTACK</strong>, <strong>DECAY</strong>, <strong>SUSTAIN</strong>, and <strong>RELEASE</strong> shape the synth envelope.</>,
						<><strong>REG0</strong> through <strong>REG3</strong> are general purpose VM registers for your own program logic.</>,
					]}
				/>
				<HelpBlock
					title="Syntax"
					lines={[
						<><strong>PLAY <em>instrument note</em></strong>: Play <em>note</em> on <em>instrument</em> for one beat.</>,
						<><strong>REST <em>beats</em></strong>: Wait for <em>beats</em> beats before the next instruction.</>,
						<><strong>LOAD <em>register value</em></strong>: Write a value into a register.</>,
						<><strong>ADD <em>register value</em></strong>: Add a value to an existing register.</>,
						<><strong>STORE <em>address value</em></strong>: Write a value into shared memory.</>,
						<><strong><em>label</em>:</strong> Declare a jump target.</>,
						<><strong>JUMP <em>label</em></strong>: Jump to a label unconditionally.</>,
						<><strong>JMPZ <em>register</em> <em>label</em></strong>: Jump if the register is zero.</>,
					]}
				/>
			</Card>
		</div>,
		document.body,
	);
}

export default function Help() {
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				event.preventDefault();
				setShowHelp(false);
			}
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<>
			<HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
			<Button variant="secondary" onClick={() => setShowHelp((current) => !current)}>
				Help
			</Button>
		</>
	);
}
