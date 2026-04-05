import { Instrument, MusicEvent } from "@/common/types";

const SAMPLE_MAP: Map<number, string> = new Map([
	[60, "/COMSM0052/samples/kick.wav"],
	[61, "/COMSM0052/samples/snare.wav"],
	[62, "/COMSM0052/samples/hat.wav"],
]);

const semitoneToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function midiToFreq(note: number): number {
	return 440 * (2 ** ((note - 69) / 12));
}

function createPanVolOut(ctx: AudioContext, dest: AudioNode, vol: number, pan: number) {
	const output = ctx.createGain();
	output.gain.value = clamp(vol, 0, 100) / 100;

	const panner = ctx.createStereoPanner();
	panner.pan.value = clamp(pan, -100, 100) / 100;

	output.connect(panner);
	panner.connect(dest);

	return { output };
}

export function midiToNote(midi: number): string {
	const noteIndex = midi % 12;
	const octave = Math.floor(midi / 12) - 1;
	if (octave < 0) return "0";
	return semitoneToNote[noteIndex] + octave.toString();
}

export class AudioEngine {
	private samples: Map<number, AudioBuffer> = new Map();
	private ctx!: AudioContext;
	private master!: GainNode;
	private compressor!: DynamicsCompressorNode;
	private init = false;

	get currentTime() {
		return this.init ? this.ctx.currentTime : 0;
	}

	start() {
		if (this.init) {
			void this.ctx.resume();
			return;
		}

		this.ctx = new AudioContext();
		this.master = this.ctx.createGain();
		this.master.gain.value = 0.18;
		this.compressor = this.ctx.createDynamicsCompressor();
		this.compressor.threshold.value = -20;
		this.compressor.knee.value = 15;
		this.compressor.ratio.value = 12;
		this.compressor.attack.value = 0.003;
		this.compressor.release.value = 0.25;
		this.master.connect(this.compressor);
		this.compressor.connect(this.ctx.destination);
		void this.loadSamples();
		this.init = true;
	}

	stop() {
		if (!this.init) return;
		void this.ctx.close();
		this.samples = new Map();
		this.init = false;
	}

	private async loadSamples() {
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

	private playSample(event: MusicEvent, when: number) {
		const buffer = this.samples.get(event.pitch ?? -1);
		if (!buffer) return;

		const source = this.ctx.createBufferSource();
		source.buffer = buffer;

		const { output } = createPanVolOut(this.ctx, this.master, event.settings.volume, event.settings.pan);
		source.connect(output);
		source.start(when);
	}

	private playSynth(event: MusicEvent, when: number) {
		if (event.pitch === undefined || event.instrument === undefined) return;

		const attack = clamp(event.settings.attack, 0, 4000) / 1000;
		const decay = clamp(event.settings.decay, 0, 4000) / 1000;
		const sustain = clamp(event.settings.sustain, 0, 100) / 100;
		const release = clamp(event.settings.release, 0, 4000) / 1000;
		const sustainStart = when + attack + decay;
		const releaseStart = when + Math.max(0.05, event.duration); // TODO: convert to seconds
		const stopTime = releaseStart + release + 0.05;

		const { output } = createPanVolOut(this.ctx, this.master, event.settings.volume, event.settings.pan);
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
		envelope.connect(output);
		osc.start(when);
		osc.stop(stopTime);
	}

	play(event: MusicEvent, when: number) {
		if (!this.init || event.type !== "play") return;

		switch (event.instrument) {
			case Instrument.DRUMS:
				this.playSample(event, when);
				break;
			case Instrument.SYNTH:
			case Instrument.BASS:
			case Instrument.PIANO:
				this.playSynth(event, when);
				break;
			default:
				break;
		}
	}
}
