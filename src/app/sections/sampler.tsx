import { SAMPLE_OPTIONS, isKnownSamplePath } from "@/audio/engine";
import Button from "../components/button";
import Card from "../components/card";
import Input from "../components/input";
import Select from "../components/select";
import { cn } from "../components/cn";
import { useMemo, useState } from "react";
import { Body, Subheading } from "../components/text";

interface SampleSelectorProps {
	samples: Map<number, string>;
	onSampleChange: (note: number, sample: string) => void;
	onSampleRemove: (note: number) => void;
}

const DEFAULT_SAMPLE_PATH = SAMPLE_OPTIONS[0]?.path ?? "";

function parseMidiNote(value: string): number | undefined {
	const trimmed = value.trim();
	if (!/^\d+$/.test(trimmed)) return undefined;

	const note = Number(trimmed);
	if (!Number.isInteger(note) || note < 0 || note > 127) return undefined;
	return note;
}

export default function SampleSelector({ samples, onSampleChange, onSampleRemove }: SampleSelectorProps) {
	const [open, setOpen] = useState(true);
	const [noteDraft, setNoteDraft] = useState("63");
	const [sampleDraft, setSampleDraft] = useState(DEFAULT_SAMPLE_PATH);
	const sampleRows = useMemo(
		() => Array.from(samples.entries()).sort(([left], [right]) => left - right),
		[samples],
	);
	const noteValue = parseMidiNote(noteDraft);
	const canAssign = noteValue !== undefined && isKnownSamplePath(sampleDraft);

	function handleAssign() {
		if (!canAssign) return;
		onSampleChange(noteValue, sampleDraft);
	}

	return (
		<Card id="samples" title="Sampler" variant="panel" className="w-full min-h-0">
			<div className="flex items-center justify-between">
				<Subheading tone="peach">Drum Note Map</Subheading>
				<Button
					size="sm"
					variant="secondary"
					tone="peach"
					onClick={() => setOpen((value) => !value)}
				>
					{open ? "Hide" : "Show"}
				</Button>
			</div>

			<div
				className={cn(
					"grid transition-[grid-template-rows,opacity,margin-top] duration-200 ease-out",
					open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="flex min-h-0 flex-col gap-3 overflow-hidden">
					<Card className="flex max-h-61 min-h-0 flex-col gap-2 overflow-y-auto">
						{sampleRows.length ? sampleRows.map(([note, sample]) => (
							<div
								key={note}
								className="flex justify-between items-center gap-2"
							>
								<Body tone="peach" className="font-semibold mr-3">
									{note}
								</Body>
								<Select
									value={sample}
									onChange={(event) => onSampleChange(note, event.target.value)}
									className="min-w-0 w-full"
								>
									{SAMPLE_OPTIONS.map((option) => (
										<option key={option.id} value={option.path}>
											{option.label}
										</option>
									))}
								</Select>
								<Button size="sm" variant="ghost" tone="subtle" onClick={() => onSampleRemove(note)}>
									Remove
								</Button>
							</div>
						)) : (
							<Body tone="subtle" className="text-sm">
								No samples assigned.
							</Body>
						)}
					</Card>

					<div className="flex justify-between items-center gap-2 border-t border-ctp-surface0 pt-3">
						<Input
							type="number"
							min={0}
							max={127}
							value={noteDraft}
							title="MIDI note number"
							className="w-28"
							onChange={(event) => setNoteDraft(event.target.value)}
						/>
						<Select
							value={sampleDraft}
							onChange={(event) => setSampleDraft(event.target.value)}
							className="min-w-0 w-full bg-ctp-crust"
						>
							{SAMPLE_OPTIONS.map((option) => (
								<option key={option.id} value={option.path}>
									{option.label}
								</option>
							))}
						</Select>
						<Button variant="primary" size="sm" disabled={!canAssign} onClick={handleAssign}>
							Assign
						</Button>
					</div>

					<Body tone="subtle" className="text-xs">
						Defaults: 60 Kick, 61 Snare, 62 Hi-Hat.
					</Body>
				</div>
			</div>
		</Card>
	);
}
