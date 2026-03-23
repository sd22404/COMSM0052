import { Instrument } from "@/core/types";

const midiToFreq = function(note: number): number {
	const A = 440;
	const freq = (A / 32) * (2 ** ((note - 9) / 12));
	return freq;
}

const noteToSemitone: Record<string, number> = {
	'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
	'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
	'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
}

const semitoneToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const midiToNote = function(midi: number): string {
	const noteIndex = midi % 12;
	const octave = Math.floor(midi / 12) - 1;
	if (octave < 0) return "0";
	return semitoneToNote[noteIndex] + octave.toString();
}

const SAMPLE_PATHS: string[] = [
	"/COMSM0052/samples/kick.wav",
	"/COMSM0052/samples/snare.wav",
	"/COMSM0052/samples/hat.wav",
];

export class AudioEngine {
	private _samples: AudioBuffer[] = [];
	private _gain!: GainNode;
	private _volume: number = 100;
	private _bpm: number = 120;
	private _clickMs: number = 60000 / this._bpm;
	private _audioContext!: AudioContext;
	private _activeNotes = new Map<string, AudioBufferSourceNode | OscillatorNode>()
	private _initialized = false;

	init() {
		if (this._initialized) {
			if (this._audioContext.state === "suspended") void this._audioContext.resume();
			return;
		}
		this._audioContext = new AudioContext();
		this._gain = this._audioContext.createGain();
		this._gain.connect(this._audioContext.destination);
		this._gain.gain.value = this._volume / 100;
		this._loadSamples();
		this._initialized = true;
	}

	private async _loadSamples() {
		for (const path of SAMPLE_PATHS) {
			try {
				const res = await fetch(path);
				const buf = await res.arrayBuffer();
				this._samples.push(await this._audioContext.decodeAudioData(buf));
			} catch (e) {
				console.error(`Failed to load sample #${SAMPLE_PATHS.indexOf(path)}:`, e);
			}
		}
	}

	private _playSample(index: number, time: number) {
		const buffer = this._samples[index];
		if (!buffer) return;
		const source = this._audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(this._gain);
		if (this._activeNotes.has(`${Instrument.DRUM}:${index}`))
			source.stop();
		this._activeNotes.set(`${Instrument.DRUM}:${index}`, source);
		source.start(time);
	}

	get volume() {
		return this._volume;
	}

	set volume(volume: number) {
		this._volume = volume;
		this._gain.gain.value = volume / 100;
	}

	get bpm() {
		return this._bpm;
	}

	set bpm(bpm: number) {
		this._bpm = bpm;
		this._clickMs = 60000 / this._bpm;
	}

	get clickMs() {
		return this._clickMs;
	}

	currentTime() {
		return this._audioContext.currentTime;
	}

	play(instrument: Instrument, note: number, velocity?: number, time?: number) {
		const now = this._audioContext.currentTime;
		const startTime = Math.max(time ?? now, now + 0.001);

		switch (instrument) {
			case Instrument.DRUM:
				this._playSample(note, startTime);
				break;
			case Instrument.SYNTH: {
				const osc = this._audioContext.createOscillator();
				osc.connect(this._gain);
				osc.frequency.value = midiToFreq(note);
				this._activeNotes.set(`${Instrument.SYNTH}:${note}`, osc);
				osc.start(startTime);

				console.log(`Playing note ${midiToNote(note)} (MIDI ${note}) at time ${startTime.toFixed(2)}s`);
				console.log(this._activeNotes);
				break;
			}
			default:
				break;
		}
	}

	stop(instrument: Instrument, note: number, time?: number) {
		const now = this._audioContext.currentTime;
		const stopTime = Math.max(time ?? now, now + 0.001);
		const key = `${instrument}:${note}`;
		const source = this._activeNotes.get(key);
		if (source) {
			source.stop(stopTime);
			this._activeNotes.delete(key);
		}
	}

	stopAll() {
		for (const source of this._activeNotes.values()) {
			source.stop();
		}
		this._activeNotes.clear();
	}
}
