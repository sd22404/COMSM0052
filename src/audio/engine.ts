import { Device, Note, PlayWindow, Sample, SampleOption } from "@/common/types";
import config from "@/next.config";

const SAMPLE_BASE = config.assetPrefix + "samples";

function samplePath(group: string, file: string) {
	return `${SAMPLE_BASE}/${group}/${file}`;
}

export const SAMPLE_OPTIONS: SampleOption[] = [
	{ id: "kick-acoustic", label: "Kick", path: samplePath("kicks", "CYCdh_AcouKick-01.wav") },
	{ id: "kick-tight", label: "Kick Tight", path: samplePath("kicks", "CYCdh_AcouKick-05.wav") },
	{ id: "kick-deep", label: "Kick Deep", path: samplePath("kicks", "CYCdh_AcouKick-11.wav") },
	{ id: "snare-acoustic", label: "Snare", path: samplePath("snares", "Acoustic Snare-01.wav") },
	{ id: "snare-bright", label: "Snare Bright", path: samplePath("snares", "Acoustic Snare-03.wav") },
	{ id: "hat-closed", label: "Hi-Hat", path: samplePath("hats", "Acoustic Hat-01.wav") },
	{ id: "hat-open", label: "Open Hat", path: samplePath("hats", "Acoustic Hat-04.wav") },
	{ id: "crash", label: "Crash", path: samplePath("cymbals", "CYCdh_Crash-03.wav") },
];

const SAMPLE_PATHS = new Set(SAMPLE_OPTIONS.map((sample) => sample.path));
const DEFAULT_SAMPLE_ASSIGNMENTS: Array<[number, string]> = [
	[60, samplePath("kicks", "CYCdh_AcouKick-01.wav")],
	[61, samplePath("snares", "Acoustic Snare-01.wav")],
	[62, samplePath("hats", "Acoustic Hat-01.wav")],
];

function isMidiNote(note: number) {
	return Number.isInteger(note) && note >= 0 && note <= 127;
}

export function isKnownSamplePath(path: string) {
	return SAMPLE_PATHS.has(path);
}

export function createDefaultSampleMap(): Map<number, Sample> {
	return new Map(DEFAULT_SAMPLE_ASSIGNMENTS.map(([note, path]) => [note, { path }]));
}

export function createDefaultSamplePaths(): Map<number, string> {
	return new Map(DEFAULT_SAMPLE_ASSIGNMENTS);
}

const semitoneToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteToSemitone: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const MASTER_GAIN = 0.18;
const EPSILON = 1e-3;

type ActiveSource = AudioBufferSourceNode | OscillatorNode;

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function midiToFreq(note: number): number { return 440 * (2 ** ((note - 69) / 12)); }

function tryDisconnect(node: AudioNode) {
	try {
		node.disconnect();
	} catch {}
}

function tryStop(source: ActiveSource, when: number) {
	try {
		source.stop(when);
	} catch {}
}

function createVolPan(ctx: AudioContext, dest: AudioNode, vol: number, pan: number) {
	const volume = ctx.createGain();
	volume.gain.value = clamp(vol, 0, 100) / 100;

	const panner = ctx.createStereoPanner();
	panner.pan.value = clamp(pan, -100, 100) / 100;

	volume.connect(panner);
	panner.connect(dest);

	return { volume, panner };
}

export function midiToNote(midi: number): string {
	const noteIndex = midi % 12;
	const octave = Math.floor(midi / 12) - 1;
	if (octave < 0) return "0";
	return semitoneToNote[noteIndex] + octave.toString();
}

export function noteToMidi(note: string): number | undefined {
	const match = note.trim().match(/^([A-Ga-g])([#b]?)(\d+)$/);
	if (!match) return undefined;

	const [, letterRaw, accidentalRaw, octaveRaw] = match;
	const base = noteToSemitone[letterRaw.toUpperCase()];
	const octave = parseInt(octaveRaw);
	if (isNaN(octave)) return undefined;

	const accidental = accidentalRaw === "#" ? 1 : accidentalRaw === "b" ? -1 : 0;
	const midi = (octave + 1) * 12 + base + accidental;
	if (midi < 0 || midi > 127) return undefined;

	return midi;
}

export class AudioEngine {
	private _samples = createDefaultSampleMap();
	private ctx?: AudioContext;
	private master?: GainNode;
	private compressor?: DynamicsCompressorNode;
	private readonly activeSources = new Map<ActiveSource, () => void>();

	get time() {
		return this.ctx?.currentTime ?? 0;
	}

	get samples() {
		return new Map<number, string>(Array.from(this._samples.entries()).map(([key, value]) => [key, value.path]));
	}

	private init() {
		if (this.ctx) return;

		this.ctx = new AudioContext();
		this.master = this.ctx.createGain();
		this.compressor = this.ctx.createDynamicsCompressor();
		this.compressor.threshold.value = -20;
		this.compressor.knee.value = 15;
		this.compressor.ratio.value = 12;
		this.compressor.attack.value = 0.003;
		this.compressor.release.value = 0.25;

		this.master.connect(this.compressor);
		this.compressor.connect(this.ctx.destination);
		this.setMasterVolume(100);
	}

	private registerSource(source: ActiveSource, cleanup: () => void) {
		let finalised = false;
		const finish = () => {
			if (finalised) return;
			finalised = true;
			this.activeSources.delete(source);
			cleanup();
		};

		source.onended = finish;
		this.activeSources.set(source, finish);
	}

	async ready() {
		this.init();
		if (!this.ctx) return;

		if (this.ctx.state === "suspended")
			await this.ctx.resume();

		await Promise.all(
			Array.from(this._samples.keys(), (midiNote) => this.ensureSampleLoaded(midiNote)),
		);
	}

	setMasterVolume(value: number) {
		if (!this.master) return;
		this.master.gain.value = (clamp(value, 0, 100) / 100) * MASTER_GAIN;
	}

	reset() {
		this.panic();
		this.setMasterVolume(100);
	}

	panic() {
		if (!this.ctx) return;

		for (const [source, cleanup] of Array.from(this.activeSources.entries())) {
			source.onended = null;
			tryStop(source, this.ctx.currentTime);
			cleanup();
		}
	}

	private async loadSample(midiNote: number) {
		const sample = this._samples.get(midiNote);
		if (!sample || !this.ctx || sample.buf) return;

		sample.promise = (async () => {
			const res = await fetch(sample.path);
			if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

			const buf = await res.arrayBuffer();
			sample.buf = await this.ctx!.decodeAudioData(buf);
		})();

		try {
			await sample.promise;
		} catch (error) {
			console.error(`Failed to load sample #${midiNote}:`, error);
		} finally {
			sample.promise = undefined;
		}
	}

	private ensureSampleLoaded(midiNote: number) {
		const sample = this._samples.get(midiNote);
		if (!sample || sample.buf) return;

		if (sample.promise) return sample.promise;
		return this.loadSample(midiNote);
	}

	private scheduleSample(note: Note, when: number): PlayWindow | undefined {
		if (!this.ctx || !this.master) return undefined;

		const sample = this._samples.get(note.pitch);
		if (!sample?.buf) return undefined;

		const source = this.ctx.createBufferSource();
		source.buffer = sample.buf;

		const { volume, panner } = createVolPan(this.ctx, this.master, note.settings.volume, note.settings.pan);
		source.connect(volume);
		this.registerSource(source, () => {
			tryDisconnect(source);
			tryDisconnect(volume);
			tryDisconnect(panner);
		});
		source.start(when);
		return {
			start: when,
			end: when + sample.buf.duration,
		};
	}

	private scheduleSynth(note: Note, when: number, duration: number): PlayWindow | undefined {
		if (!this.ctx || !this.master) return undefined;

		const attack = clamp(note.settings.attack, 0, 4000) / 1000;
		const release = clamp(note.settings.release, 0, 4000) / 1000;
		const releaseStart = when + Math.max(0.05, duration);
		const stopTime = releaseStart + release + 0.05;

		if (!note.pitch) return { start: when, end: stopTime };

		const { volume, panner } = createVolPan(this.ctx, this.master, note.settings.volume, note.settings.pan);
		const envelope = this.ctx.createGain();
		envelope.gain.setValueAtTime(0.0001, when);

		if (attack > 0) envelope.gain.linearRampToValueAtTime(1, when + attack);
		else envelope.gain.setValueAtTime(1, when);

		envelope.gain.setValueAtTime(1, releaseStart);
		if (release > 0) envelope.gain.linearRampToValueAtTime(0.0001, stopTime);
		else envelope.gain.setValueAtTime(0.0001, releaseStart);

		const osc = this.ctx.createOscillator();
		osc.type = note.device === Device.BASS ? "square" : note.device === Device.PIANO ? "triangle" : "sawtooth";
		osc.frequency.value = midiToFreq(note.pitch);
		osc.connect(envelope);
		envelope.connect(volume);
		this.registerSource(osc, () => {
			tryDisconnect(osc);
			tryDisconnect(envelope);
			tryDisconnect(volume);
			tryDisconnect(panner);
		});
		osc.start(when);
		osc.stop(stopTime);
		return {
			start: when,
			end: stopTime,
		};
	}

	schedule(note: Note, when: number, duration: number): PlayWindow | undefined {
		if (!this.ctx) return undefined;

		const startTime = Math.max(when, this.ctx.currentTime + EPSILON);
		const noteDuration = Math.max(0, duration);

		switch (note.device) {
			case Device.DRUMS:
				return this.scheduleSample(note, startTime);
			case Device.SYNTH:
			case Device.BASS:
			case Device.PIANO:
				return this.scheduleSynth(note, startTime, noteDuration);
			default:
				return undefined;
		}
	}

	async setSample(note: number, samplePath: string) {
		if (!isMidiNote(note) || !isKnownSamplePath(samplePath)) return;

		this._samples.set(note, { path: samplePath, buf: undefined });
		if (!this.ctx) return;
		await this.ensureSampleLoaded(note);
	}

	unsetSample(note: number) {
		if (!isMidiNote(note)) return;
		this._samples.delete(note);
	}
}
