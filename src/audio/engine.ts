import { Instrument, NoteEvent } from "@/common/types";

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

function beatsToSeconds(beats: number, bpm: number) {
	return (60 / Math.max(bpm, 1)) * Math.max(1, beats || 1);
}

function createVoiceOutput(ctx: AudioContext, destination: AudioNode, volume: number, pan: number) {
	const output = ctx.createGain();
	output.gain.value = clamp(volume, 0, 100) / 100;

	const panner = ctx.createStereoPanner();
	panner.pan.value = clamp(pan, -100, 100) / 100;

	output.connect(panner);
	panner.connect(destination);

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
	private init = false;

	start() {
		if (this.init) return;
		this.ctx = new AudioContext();
		this.master = this.ctx.createGain();
		this.master.gain.value = 0.18;
		this.master.connect(this.ctx.destination);
		this.loadSamples();
		this.init = true;
	}

	stop() {
		if (!this.init) return;
		this.ctx.close();
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

	private playSample(event: NoteEvent) {
		const buffer = this.samples.get(event.pitch);
		if (!buffer) return;

		const source = this.ctx.createBufferSource();
		source.buffer = buffer;

		const { output } = createVoiceOutput(this.ctx, this.master, event.settings.volume, event.settings.pan);
		source.connect(output);
		source.start(this.ctx.currentTime);
	}

	private playSynth(event: NoteEvent) {
		const start_time = this.ctx.currentTime;
		const attack = clamp(event.settings.attack, 0, 4000) / 1000;
		const decay = clamp(event.settings.decay, 0, 4000) / 1000;
		const sustain = clamp(event.settings.sustain, 0, 100) / 100;
		const release = clamp(event.settings.release, 0, 4000) / 1000;
		const duration_seconds = beatsToSeconds(event.duration, event.settings.bpm);
		const sustain_start = start_time + attack + decay;
		const release_start = start_time + duration_seconds;
		const stop_time = release_start + release + 0.05;

		const { output } = createVoiceOutput(this.ctx, this.master, event.settings.volume, event.settings.pan);
		const envelope = this.ctx.createGain();
		envelope.gain.setValueAtTime(0.0001, start_time);

		if (attack > 0) envelope.gain.linearRampToValueAtTime(1, start_time + attack);
		else envelope.gain.setValueAtTime(1, start_time);

		if (decay > 0) envelope.gain.linearRampToValueAtTime(Math.max(0.0001, sustain), sustain_start);
		else envelope.gain.setValueAtTime(Math.max(0.0001, sustain), start_time);

		envelope.gain.setValueAtTime(Math.max(0.0001, sustain), release_start);
		if (release > 0) envelope.gain.linearRampToValueAtTime(0.0001, stop_time);
		else envelope.gain.setValueAtTime(0.0001, release_start);

		const osc = this.ctx.createOscillator();
		osc.type = event.instrument === Instrument.BASS ? "square" : event.instrument === Instrument.PIANO ? "triangle" : "sawtooth";
		osc.frequency.value = midiToFreq(event.pitch);
		osc.connect(envelope);
		envelope.connect(output);
		osc.start(start_time);
		osc.stop(stop_time);
	}

	play(event: NoteEvent) {
		if (!this.init) return;

		switch (event.instrument) {
			case Instrument.DRUMS:
				this.playSample(event);
				break;
			case Instrument.SYNTH:
			case Instrument.BASS:
			case Instrument.PIANO:
				this.playSynth(event);
				break;
			default:
				break;
		}
	}
}
