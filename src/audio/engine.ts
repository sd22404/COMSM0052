import { Instrument, NoteEvent, PlayWindow } from "@/common/types";

const SAMPLE_MAP: Map<number, string> = new Map([
	[60, "/COMSM0052/samples/kick.wav"],
	[61, "/COMSM0052/samples/snare.wav"],
	[62, "/COMSM0052/samples/hat.wav"],
]);

const semitoneToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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
	volume.gain.value = clamp(vol, 0, 100) / 100 * MASTER_GAIN;

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

export class AudioEngine {
	private samples: Map<number, AudioBuffer> = new Map();
	private ctx?: AudioContext;
	private master?: GainNode;
	private compressor?: DynamicsCompressorNode;
	private readonly activeSources = new Map<ActiveSource, () => void>();
	private samplePromise?: Promise<void>;

	get time() {
		return this.ctx?.currentTime ?? 0;
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

		this.samplePromise ??= this.loadSamples();
		await this.samplePromise;
	}

	setMasterVolume(value: number) {
		if (!this.master) return;
		this.master.gain.value = (clamp(value, 0, 100) / 100) * MASTER_GAIN;
	}

	panic() {
		if (!this.ctx) return;

		for (const [source, cleanup] of Array.from(this.activeSources.entries())) {
			source.onended = null;
			tryStop(source, this.ctx.currentTime);
			cleanup();
		}
	}

	private async loadSamples() {
		if (!this.ctx) return;

		for (const [midiNote, path] of SAMPLE_MAP.entries()) {
			try {
				const res = await fetch(path);
				const buf = await res.arrayBuffer();
				this.samples.set(midiNote, await this.ctx.decodeAudioData(buf));
			} catch (error) {
				console.error(`Failed to load sample #${midiNote}:`, error);
			}
		}
	}

	private scheduleSample(event: NoteEvent, when: number): PlayWindow | undefined {
		if (!this.ctx || !this.master) return undefined;

		const buffer = this.samples.get(event.pitch);
		if (!buffer) return undefined;

		const source = this.ctx.createBufferSource();
		source.buffer = buffer;

		const { volume, panner } = createVolPan(this.ctx, this.master, event.settings.volume, event.settings.pan);
		source.connect(volume);
		this.registerSource(source, () => {
			tryDisconnect(source);
			tryDisconnect(volume);
			tryDisconnect(panner);
		});
		source.start(when);
		return {
			start: when,
			end: when + buffer.duration,
		};
	}

	private scheduleSynth(event: NoteEvent, when: number, duration: number): PlayWindow | undefined {
		if (!this.ctx || !this.master) return undefined;

		const attack = clamp(event.settings.attack, 0, 4000) / 1000;
		const decay = clamp(event.settings.decay, 0, 4000) / 1000;
		const sustain = clamp(event.settings.sustain, 0, 100) / 100;
		const release = clamp(event.settings.release, 0, 4000) / 1000;
		const sustainStart = when + attack + decay;
		const releaseStart = when + Math.max(0.05, duration);
		const stopTime = releaseStart + release + 0.05;

		const { volume, panner } = createVolPan(this.ctx, this.master, event.settings.volume, event.settings.pan);
		const envelope = this.ctx.createGain();
		envelope.gain.setValueAtTime(0.0001, when);

		if (attack > 0) envelope.gain.linearRampToValueAtTime(1, when + attack);
		else envelope.gain.setValueAtTime(1, when);

		if (decay > 0) envelope.gain.linearRampToValueAtTime(Math.max(0.0001, sustain), sustainStart);
		else envelope.gain.setValueAtTime(Math.max(0.0001, sustain), when);

		envelope.gain.setValueAtTime(Math.max(0.0001, sustain), releaseStart);
		if (release > 0) envelope.gain.linearRampToValueAtTime(0.0001, stopTime);
		else envelope.gain.setValueAtTime(0.0001, releaseStart);

		const osc = this.ctx.createOscillator();
		osc.type = event.instrument === Instrument.BASS ? "square" : event.instrument === Instrument.PIANO ? "triangle" : "sawtooth";
		osc.frequency.value = midiToFreq(event.pitch);
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

	schedule(note: NoteEvent, when: number, duration: number): PlayWindow | undefined {
		if (!this.ctx) return undefined;

		const startTime = Math.max(when, this.ctx.currentTime + EPSILON);
		const noteDuration = Math.max(0, duration);

		switch (note.instrument) {
			case Instrument.DRUMS:
				return this.scheduleSample(note, startTime);
			case Instrument.SYNTH:
			case Instrument.BASS:
			case Instrument.PIANO:
				return this.scheduleSynth(note, startTime, noteDuration);
			default:
				return undefined;
		}
	}
}
