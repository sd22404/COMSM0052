import Button from "@/app/components/button";
import Card from "@/app/components/card";
import { cn } from "@/app/components/cn";
import { Body, Eyebrow, Subheading } from "@/app/components/text";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type HelpTab = "syntax" | "controls";
type HelpTone = "blue" | "green" | "mauve" | "peach";

const HELP_TONE_CLASSES: Record<HelpTone, string> = {
	blue: "[&_code]:border-ctp-blue/30 [&_code]:text-ctp-blue",// [&_strong]:text-ctp-blue",
	green: "[&_code]:border-ctp-green/30 [&_code]:text-ctp-green",// [&_strong]:text-ctp-green",
	mauve: "[&_code]:border-ctp-mauve/30 [&_code]:text-ctp-mauve",// [&_strong]:text-ctp-mauve",
	peach: "[&_code]:border-ctp-peach/30 [&_code]:text-ctp-peach",// [&_strong]:text-ctp-peach",
};

function HelpBlock({
	title,
	lines,
	tone = "blue",
}: {
	title: string;
	lines: ReactNode[];
	tone?: HelpTone;
}) {
	return (
		<section className="flex flex-col gap-2">
			<Subheading tone="blue">{title}</Subheading>
			{lines.map((line, index) => (
				<span
					key={`${title}-${index}`}
					className={cn(
						"text-sm leading-relaxed text-ctp-subtext0",
						"[&_code]:rounded [&_code]:border [&_code]:bg-ctp-crust [&_code]:px-1 [&_code]:py-0.5",
						"[&_strong]:font-semibold [&_strong]:text-ctp-text",
						HELP_TONE_CLASSES[tone],
					)}
				>
					{line}
				</span>
			))}
		</section>
	);
}

function TabButton({
	active,
	children,
	onClick,
	tone = "blue",
}: {
	active: boolean;
	children: ReactNode;
	onClick: () => void;
	tone?: HelpTone;
}) {
	return (
		<button
			type="button"
			className={cn(
				"rounded px-3 py-2 text-sm font-semibold transition-colors hover:cursor-pointer",
				active && "bg-ctp-blue text-ctp-base",
				!active && tone === "blue" && "bg-ctp-surface0 text-ctp-blue hover:bg-ctp-blue/15",
				!active && tone === "green" && "bg-ctp-surface0 text-ctp-green hover:bg-ctp-green/15",
				!active && tone === "mauve" && "bg-ctp-surface0 text-ctp-mauve hover:bg-ctp-mauve/15",
				!active && tone === "peach" && "bg-ctp-surface0 text-ctp-peach hover:bg-ctp-peach/15",
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

function SyntaxGuide() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<HelpBlock
				title="Program Shape"
				tone="mauve"
				lines={[
					<><strong>Comments</strong>: <code>;</code> runs to end of line.</>,
					<><strong>Instructions</strong>: opcode, then space-separated operands.</>,
					<><strong>Labels</strong>: <code>name:</code> marks a jump target and takes no time.</>,
					<><strong>Names</strong>: Opcodes, registers, and devices are uppercase: <code>PLAY</code>, <code>REG0</code>, <code>PIANO</code>.</>,
				]}
			/>
			<HelpBlock
				title="Operands"
				tone="mauve"
				lines={[
					<><strong>Numbers</strong>: <code>60</code>, <code>4</code>, <code>-1</code>.</>,
					<><strong>Registers</strong>: <code>VOL</code>, <code>PAN</code>, <code>ATK</code>, <code>DEC</code>, <code>SUS</code>, <code>REL</code>, <code>REG0</code>-<code>REG3</code>, <code>RAND</code>.</>,
					<><strong>Devices</strong>: <code>SYNTH</code>, <code>DRUMS</code>, <code>BASS</code>, <code>PIANO</code>.</>,
					<><strong>Values</strong>: number, register, or memory read.</>,
				]}
			/>
			<HelpBlock
				title="Memory Addressing"
				tone="peach"
				lines={[
					<><strong>Direct</strong>: <code>[12]</code> reads memory cell 12.</>,
					<><strong>Register-held</strong>: <code>[REG0]</code> reads <code>REG0</code>, then uses it as the address.</>,
					<><strong>STORE</strong>: <code>STORE 12 REG1</code> or <code>STORE REG0 REG1</code> writes to the first operand.</>,
					<><strong>Range</strong>: addresses <code>0</code>-<code>31</code>; invalid access faults this core.</>,
				]}
			/>
			<HelpBlock
				title="Registers"
				tone="green"
				lines={[
					<><strong>VOL</strong>: per-core volume.</>,
					<><strong>PAN</strong>: negative left, positive right.</>,
					<><strong>ATK DEC SUS REL</strong>: envelope shape.</>,
					<><strong>REG0-REG3</strong>: pitches, counters, addresses, durations.</>,
					<><strong>RAND</strong>: write a bound; reads return <code>0</code> to bound minus one.</>,
				]}
			/>
			<HelpBlock
				title="Sound And Time"
				tone="green"
				lines={[
					<><strong><code>PLAY DEVICE pitch (ticks)</code></strong>: play now; duration defaults to <code>1</code>.</>,
					<><strong><code>REST ticks</code></strong>: move this core forward.</>,
					<><strong>Ticks</strong>: 4 per beat; <code>REST 4</code> is one beat.</>,
					<><strong>Duration</strong>: <code>PLAY SYNTH 64 2</code> plays pitch 64 for 2 ticks.</>,
				]}
			/>
			<HelpBlock
				title="Data Instructions"
				tone="peach"
				lines={[
					<><strong><code>LOAD register value</code></strong>: write a register, e.g. <code>LOAD VOL 80</code>.</>,
					<><strong><code>STORE address value</code></strong>: write memory, e.g. <code>STORE 12 REG0</code>.</>,
					<><strong><code>ADD register value</code></strong>: add into a register, e.g. <code>ADD REG1 -1</code>.</>,
				]}
			/>
			<HelpBlock
				title="Flow Instructions"
				tone="blue"
				lines={[
					<><strong><code>JUMP label</code></strong>: always move to a label or instruction index.</>,
					<><strong><code>JMPZ register label</code></strong>: jump only when the register is zero.</>,
					<><strong>Loops</strong>: label, timed work such as <code>REST</code>, then jump back.</>,
				]}
			/>
			<HelpBlock
				title="Runtime Faults"
				tone="peach"
				lines={[
					<>Non-positive <code>PLAY</code> duration or <code>REST</code> length.</>,
					<>Memory outside <code>0</code>-<code>31</code>.</>,
					<>Too many zero-time instructions without a <code>REST</code>.</>,
				]}
			/>
		</div>
	);
}

function ControlsGuide() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<HelpBlock
				title="Keyboard"
				tone="blue"
				lines={[
					<><strong>Ctrl+Enter</strong>: compile/load focused core, even during playback.</>,
					<><strong>Escape</strong>: close Help.</>,
					<>Tab and Shift+Tab move through controls.</>,
				]}
			/>
			<HelpBlock
				title="Master Controls"
				tone="green"
				lines={[
					<><strong>Start / Stop</strong>: toggle playback.</>,
					<><strong>Reset</strong>: reset memory, registers, transport, and enabled cores; keep editor text.</>,
					<><strong>BPM</strong>: global tempo.</>,
					<><strong>VOL</strong>: global output, separate from core <code>VOL</code>.</>,
				]}
			/>
			<HelpBlock
				title="Core Status"
				tone="mauve"
				lines={[
					<><strong>Idle</strong>: stopped or no active program.</>,
					<><strong>Active</strong>: loaded and running.</>,
					<><strong>Invalid</strong>: compile errors.</>,
					<><strong>Unloaded</strong>: editor changed since load.</>,
					<><strong>Faulted</strong>: runtime stopped that core.</>,
				]}
			/>
			<HelpBlock
				title="Highlights"
				tone="blue"
				lines={[
					<>Code: recent instructions.</>,
					<>Registers: reads and writes for that core.</>,
					<>Memory: shared reads and writes.</>,
				]}
			/>
			<HelpBlock
				title="Memory Panel"
				tone="blue"
				lines={[
					<>Edit cells live during playback.</>,
					<><strong>Show notes</strong>: display MIDI values as note names.</>,
					<><strong>Show numbers</strong>: display raw values.</>,
				]}
			/>
			<HelpBlock
				title="Drum Note Map"
				tone="peach"
				lines={[
					<>Map MIDI notes to drum samples.</>,
					<>Defaults: <code>60</code> kick, <code>61</code> snare, <code>62</code> hi-hat.</>,
					<>Trigger with <code>PLAY DRUMS note</code>.</>,
				]}
			/>
		</div>
	);
}

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	const [activeTab, setActiveTab] = useState<HelpTab>("syntax");
	if (!open) return null;

	return createPortal(
		<div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-ctp-crust/70 p-4 font-mono backdrop-blur-sm">
			<Card
				variant="panel"
				className="flex max-h-[86vh] w-[min(960px,calc(100vw-2rem))] flex-col gap-5 overflow-hidden p-5"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1">
						<Eyebrow tone="mauve">Reference</Eyebrow>
						<Subheading tone="blue">Help Guide</Subheading>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<TabButton active={activeTab === "syntax"} onClick={() => setActiveTab("syntax")}>
							Syntax Guide
						</TabButton>
						<TabButton active={activeTab === "controls"} onClick={() => setActiveTab("controls")}>
							Controls
						</TabButton>
					</div>
				</div>

				<Body tone="peach" className="text-sm">
					{activeTab === "syntax"
						? "Instruction shapes, operands, memory, and faults."
						: "Shortcuts, playback, status, memory, and samples."}
				</Body>

				<div className="min-h-0 overflow-y-auto pr-1">
					{activeTab === "syntax" ? <SyntaxGuide /> : <ControlsGuide />}
				</div>

				<div className="flex justify-end">
					<Button variant="secondary" onClick={onClose}>
						Close
					</Button>
				</div>
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
			<Button
				variant="secondary"
				tone="blue"
				onClick={() => setShowHelp((current) => !current)}
			>
				Help
			</Button>
		</>
	);
}
