import Button from "@/app/components/button";
import Card from "@/app/components/card";
import { Subheading } from "@/app/components/text";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

function HelpBlock({ title, lines }: { title: string; lines: ReactNode[] }) {
	return (
		<div className="flex flex-col gap-2">
			<Subheading>{title}</Subheading>
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
						<><strong>Ctrl+Enter</strong>: Load the focused code into its matching core.</>,
						<><strong>Active/Idle</strong>: Indicators for the status of each core. Click to toggle. Enabling takes effect on the next down beat.</>,
						<><strong>Unloaded</strong>: Shows when editor text differs from the last valid program loaded in that core.</>,
						<><strong>Invalid</strong>: The editor has semantic or syntax errors, so load is blocked and the last valid program stays active.</>,
						<><strong>Faulted</strong>: The core hit a runtime error such as a zero-time loop or a non-positive <strong>REST</strong>.</>,
						<><strong>Reset</strong>: Restores machine state, registers, memory, tempo, and enabled flags to defaults while keeping your editor text.</>,
						<><strong>Master BPM</strong> and <strong>VOL</strong>: Overall tempo and volume controls.</>,
						<><strong>Escape</strong>: Close this popup.</>,
					]}
				/>
				<HelpBlock
					title="Registers"
					lines={[
						<><strong>VOL</strong> controls the volume of each core.</>,
						<><strong>PAN</strong> controls stereo position per core.</>,
						<><strong>ATK</strong>, <strong>DEC</strong>, <strong>SUS</strong>, and <strong>REL</strong> shape the synth envelope.</>,
						<><strong>REG0</strong> through <strong>REG3</strong> are general purpose VM registers for your own program logic.</>,
					]}
				/>
				<HelpBlock
					title="Syntax"
					lines={[
						<><strong>PLAY <em>instrument note</em></strong>: Emit a note at the core&apos;s current beat without advancing time.</>,
						<><strong>REST <em>beats</em></strong>: Advance the core&apos;s musical beat by <em>beats</em>.</>,
						<><strong>LOAD <em>register value</em></strong>: Write a value into a register.</>,
						<><strong>STORE <em>address value</em></strong>: Write a value into shared memory using an immediate address or register-held address.</>,
						<><strong>ADD <em>register value</em></strong>: Add a value to an existing register.</>,
						<><strong><em>label</em>:</strong> Declare a jump target.</>,
						<><strong>JUMP <em>label|index</em></strong>: Jump unconditionally.</>,
						<><strong>JMPZ <em>register</em> <em>label|index</em></strong>: Jump if the register is zero.</>,
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
