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
	blue: "[&_code]:border-ctp-blue/30 [&_code]:text-ctp-blue",
	green: "[&_code]:border-ctp-green/30 [&_code]:text-ctp-green",
	mauve: "[&_code]:border-ctp-mauve/30 [&_code]:text-ctp-mauve",
	peach: "[&_code]:border-ctp-peach/30 [&_code]:text-ctp-peach",
};

const ACCENT_TONE_CLASSES: Record<HelpTone, string> = {
	blue: "text-ctp-blue",
	green: "text-ctp-green",
	mauve: "text-ctp-mauve",
	peach: "text-ctp-peach",
};

const CODE_TONE_CLASSES: Record<HelpTone, string> = {
	blue: "!border-ctp-blue/30 !text-ctp-blue",
	green: "!border-ctp-green/30 !text-ctp-green",
	mauve: "!border-ctp-mauve/30 !text-ctp-mauve",
	peach: "!border-ctp-peach/30 !text-ctp-peach",
};

function Accent({ children, tone }: { children: ReactNode; tone: HelpTone }) {
	return <span className={cn("font-semibold", ACCENT_TONE_CLASSES[tone])}>{children}</span>;
}

function HelpCode({ children, tone }: { children: ReactNode; tone?: HelpTone }) {
	return <code className={tone ? CODE_TONE_CLASSES[tone] : undefined}>{children}</code>;
}

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
				!active && tone === "blue" && "bg-ctp-surface0/60 text-ctp-blue/80 hover:bg-ctp-blue/10 hover:text-ctp-blue",
				!active && tone === "green" && "bg-ctp-surface0/60 text-ctp-green/80 hover:bg-ctp-green/10 hover:text-ctp-green",
				!active && tone === "mauve" && "bg-ctp-surface0/60 text-ctp-mauve/80 hover:bg-ctp-mauve/10 hover:text-ctp-mauve",
				!active && tone === "peach" && "bg-ctp-surface0/60 text-ctp-peach/80 hover:bg-ctp-peach/10 hover:text-ctp-peach",
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
				lines={[
					<><strong>Comments</strong>: <code>;</code> runs to end of line.</>,
					<><strong>Instructions</strong>: opcode, then space-separated operands.</>,
					<><strong>Labels</strong>: <HelpCode tone="mauve">name:</HelpCode> marks a jump target and takes no time.</>,
					<><strong>Names</strong>: Opcodes, registers, and devices are uppercase: <code>PLAY</code>, <HelpCode tone="mauve">REG0</HelpCode>, <code>PIANO</code>.</>,
				]}
			/>
			<HelpBlock
				title="Operands"
				lines={[
					<><strong>Numbers</strong>: <code>60</code>, <code>4</code>, <code>-1</code>.</>,
					<><strong>Registers</strong>: <HelpCode tone="mauve">VOL</HelpCode>, <HelpCode tone="mauve">PAN</HelpCode>, <HelpCode tone="mauve">ATK</HelpCode>, <HelpCode tone="mauve">REL</HelpCode>, <HelpCode tone="mauve">REG0</HelpCode>-<HelpCode tone="mauve">REG3</HelpCode>, <HelpCode tone="mauve">RAND</HelpCode>.</>,
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
				tone="mauve"
				lines={[
					<><strong>VOL</strong>: per-core volume.</>,
					<><strong>PAN</strong>: negative left, positive right.</>,
					<><strong>ATK REL</strong>: envelope shape.</>,
					<><strong>REG0-REG3</strong>: pitches, counters, addresses, durations.</>,
					<><strong>RAND</strong>: write a bound; reads return <code>0</code> to bound minus one.</>,
				]}
			/>
			<HelpBlock
				title="Sound And Time"
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
				tone="mauve"
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
					<><strong>Ctrl+Enter</strong> (<strong>Cmd+Enter</strong> on Mac): compile/load focused core, even during playback.</>,
					<><strong>Escape</strong>: close Help.</>,
					<>Tab and Shift+Tab move through controls.</>,
				]}
			/>
			<HelpBlock
				title="Master Controls"
				lines={[
					<><strong>Start / Stop</strong>: toggle playback; <Accent tone="green">Start Audio</Accent> resumes active cores.</>,
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
					<><Accent tone="green">Active</Accent>: loaded and running.</>,
					<><Accent tone="peach">Invalid</Accent>: compile errors.</>,
					<><strong>Unloaded</strong>: editor changed since load.</>,
					<><Accent tone="peach">Faulted</Accent>: runtime stopped that core.</>,
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
				tone="peach"
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
						<Eyebrow tone="blue">Reference</Eyebrow>
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

				<Body tone="subtle" className="text-sm">
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
