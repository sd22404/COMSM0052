import Button from "@/app/components/button";
import Card from "@/app/components/card";
import { cn } from "@/app/components/cn";
import { Body, Eyebrow, Subheading } from "@/app/components/text";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type HelpTab = "syntax" | "controls";
type HelpTone = "blue" | "green" | "mauve" | "peach" | "yellow" | "teal" | "red";

const HELP_TONE_CLASSES: Record<HelpTone, string> = {
	blue: "[&_code]:border-ctp-blue/30 [&_code]:text-ctp-blue",
	green: "[&_code]:border-ctp-green/30 [&_code]:text-ctp-green",
	mauve: "[&_code]:border-ctp-mauve/30 [&_code]:text-ctp-mauve",
	peach: "[&_code]:border-ctp-peach/30 [&_code]:text-ctp-peach",
	yellow: "[&_code]:border-ctp-yellow/30 [&_code]:text-ctp-yellow",
	teal: "[&_code]:border-ctp-teal/30 [&_code]:text-ctp-teal",
	red: "[&_code]:border-ctp-red/30 [&_code]:text-ctp-red",
};

const ACCENT_TONE_CLASSES: Record<HelpTone, string> = {
	blue: "text-ctp-blue",
	green: "text-ctp-green",
	mauve: "text-ctp-mauve",
	peach: "text-ctp-peach",
	yellow: "text-ctp-yellow",
	teal: "text-ctp-teal",
	red: "text-ctp-red",
};

const CODE_TONE_CLASSES: Record<HelpTone, string> = {
	blue: "!border-ctp-blue/30 !text-ctp-blue",
	green: "!border-ctp-green/30 !text-ctp-green",
	mauve: "!border-ctp-mauve/30 !text-ctp-mauve",
	peach: "!border-ctp-peach/30 !text-ctp-peach",
	yellow: "!border-ctp-yellow/30 !text-ctp-yellow",
	teal: "!border-ctp-teal/30 !text-ctp-teal",
	red: "!border-ctp-red/30 !text-ctp-red",
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
					<><strong>Comments</strong>: <code>;</code> ignores text until end of line.</>,
					<><strong>Instructions</strong>: opcode, then space-separated operands.</>,
					<><strong>Labels</strong>: <code>name:</code> marks a jump target.</>,
					<><strong>Names</strong>: Opcodes, devices, and registers are uppercase: <HelpCode tone="mauve">PLAY</HelpCode>, <HelpCode tone="yellow">PIANO</HelpCode>, <HelpCode tone="teal">REG0</HelpCode>.</>,
				]}
			/>
			<HelpBlock
				title="Operands"
				lines={[
					<><strong>Numbers</strong>: <HelpCode tone="peach">60</HelpCode>, <HelpCode tone="peach">4</HelpCode>, <HelpCode tone="peach">-1</HelpCode>.</>,
					<><strong>Registers</strong>: <HelpCode tone="teal">VOL</HelpCode>, <HelpCode tone="teal">PAN</HelpCode>, <HelpCode tone="teal">ATK</HelpCode>, <HelpCode tone="teal">REL</HelpCode>, <HelpCode tone="teal">REG0</HelpCode>-<HelpCode tone="teal">REG3</HelpCode>, <HelpCode tone="teal">RAND</HelpCode>.</>,
					<><strong>Devices</strong>: <HelpCode tone="yellow">SYNTH</HelpCode>, <HelpCode tone="yellow">DRUMS</HelpCode>, <HelpCode tone="yellow">BASS</HelpCode>, <HelpCode tone="yellow">PIANO</HelpCode>.</>,
					<><strong>Values</strong>: number, register, or memory read.</>,
				]}
			/>
			<HelpBlock
				title="Registers"
				tone="teal"
				lines={[
					<><strong>VOL</strong>: per-core volume (0-100).</>,
					<><strong>PAN</strong>: stereo panning left (-100) to right (100).</>,
					<><strong>ATK REL</strong>: note attack / release time in milliseconds.</>,
					<><strong>REG0-REG3</strong>: pitches, counters, addresses, durations.</>,
					<><strong>RAND</strong>: writes change the upper bound; reads return a random number from <HelpCode tone="peach">0</HelpCode> to <code>RAND</code>.</>,
				]}
			/>
			<HelpBlock
				title="Sound and Time Instructions"
				tone="peach"
				lines={[
					<><strong><code><span className="text-ctp-mauve">PLAY</span> <span className="text-ctp-yellow">DEVICE</span> <span className="text-ctp-peach">pitch</span> (<span className="text-ctp-peach">ticks</span>)</code></strong>: play a MIDI note (0-127) on a device; duration defaults to <code>1</code>.</>,
					<><strong><code><span className="text-ctp-mauve">REST</span> <span className="text-ctp-peach">ticks</span></code></strong>: wait this core for a number of ticks.</>,
					<><strong><code><span className="text-ctp-mauve">PLAY</span> <span className="text-ctp-yellow">SYNTH</span> 64 2</code></strong>: plays MIDI pitch 64 for 2 ticks.</>,
					<><strong>Ticks</strong>: 4 per beat; <code><span className="text-ctp-mauve">REST</span> <span className="text-ctp-peach">4</span></code> is one beat.</>,
				]}
			/>
			<HelpBlock
				title="Memory Addressing"
				tone="green"
				lines={[
					<><strong>Direct</strong>: <code>[<span className="text-ctp-peach">12</span>]</code> reads memory cell 12.</>,
					<><strong>Register-held</strong>: <code>[<span className="text-ctp-teal">REG0</span>]</code> reads <HelpCode tone="teal">REG0</HelpCode>, then uses it as memory address to read from.</>,
					<><strong>Range</strong>: addresses <HelpCode tone="peach">0</HelpCode>-<HelpCode tone="peach">31</HelpCode>; outside this range will cause a runtime fault.</>,
				]}
			/>
			<HelpBlock
				title="Data Instructions"
				tone="mauve"
				lines={[
					<><strong><code>LOAD <span className="text-ctp-teal">register</span> <span className="text-ctp-peach">value</span></code></strong>: write value to register.</>,
					<><strong><code>STORE <span className="text-ctp-green">address</span> <span className="text-ctp-peach">value</span></code></strong>: write value to memory address. Address can be value, register or memory read.</>,
					<><strong><code>ADD <span className="text-ctp-teal">register</span> <span className="text-ctp-peach">value</span></code></strong>: add value to register.</>,
				]}
			/>
			<HelpBlock
				title="Control Instructions"
				tone="mauve"
				lines={[
					<><strong><code>JUMP <span className="text-ctp-blue">label</span></code></strong>: always skip to a label.</>,
					<><strong><code>JMPZ <span className="text-ctp-teal">register</span> <span className="text-ctp-blue">label</span></code></strong>: skip to a label only when a register's value is zero.</>,
				]}
			/>
			<HelpBlock
				title="Runtime Faults"
				tone="mauve"
				lines={[
					<>Non-positive <code>PLAY</code> duration or <code>REST</code> length.</>,
					<>Memory outside <HelpCode tone="peach">0</HelpCode>-<HelpCode tone="peach">31</HelpCode>.</>,
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
				title="Editor Keybinds"
				tone="blue"
				lines={[
					<><strong>Ctrl+Enter (Cmd+Enter)</strong>: load changed code for the focused core and enable it. Doesn't start audio.</>,
					<><strong>Ctrl+/</strong>: turn the current line into a comment.</>,
					<><strong>Ctrl+Z</strong>: undo the last action.</>,
					<><strong>Ctrl+Shift+Z (Ctrl+Y)</strong>: redo the last undone action.</>,
				]}
			/>
			<HelpBlock
				title="Master Controls"
				lines={[
					<><Accent tone="blue">Start Audio</Accent>: start enabled cores from the top.</>,
					<><Accent tone="red">Stop Audio</Accent>: halt playback and resets position.</>,
					<><strong>Reset</strong>: reset memory, registers, and enabled cores.</>,
					<><Accent tone="peach">BPM</Accent>: master tempo.</>,
					<><Accent tone="peach">VOL</Accent>: master volume.</>,
				]}
			/>
			<HelpBlock
				title="Core Status"
				lines={[
					<><strong>Idle</strong>: disabled, doesn't play sound; click to enable.</>,
					<><Accent tone="green">Active</Accent>: enabled, plays sound; click to disable.</>,
					<><Accent tone="red">Invalid</Accent>: something is wrong with the code.</>,
					<><Accent tone="yellow">Unloaded</Accent>: code has changed since load.</>,
					<><Accent tone="red">Faulted</Accent>: a runtime fault has stopped the core.</>,
				]}
			/>
			<HelpBlock
				title="Memory Panel"
				lines={[
					<><Accent tone="blue">Show notes</Accent>: display MIDI values as note names.</>,
					<><Accent tone="blue">Show numbers</Accent>: display raw MIDI values.</>,
				]}
			/>
			<HelpBlock
				title="Highlights"
				lines={[
					<><strong>Code</strong>: currently executing instructions.</>,
					<><strong>Registers</strong>: <Accent tone="blue">reads</Accent> and <Accent tone="peach">writes</Accent> for that core.</>,
					<><strong>Memory</strong>: shared <Accent tone="blue">reads</Accent> and <Accent tone="peach">writes</Accent>.</>,
				]}
			/>
			<HelpBlock
				title="Drum Note Map"
				tone="peach"
				lines={[
					<>Select the note and the sample, then click "Assign".</>,
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
				className="flex max-h-[86vh] w-[min(960px,calc(100vw-2rem))] flex-col gap-8 overflow-hidden p-5"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1">
						<Eyebrow tone="peach">reference</Eyebrow>
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
					<div>
						<Button variant="secondary" onClick={onClose}>
							Close
						</Button>
					</div>
				</div>

				<div className="min-h-0 overflow-y-auto pr-1">
					{activeTab === "syntax" ? <SyntaxGuide /> : <ControlsGuide />}
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
