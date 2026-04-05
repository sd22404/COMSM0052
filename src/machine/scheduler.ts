import { AudioEngine } from "@/audio/engine";
import { MusicEvent, SchedulerState } from "@/common/types";

const CLOCK_INTERVAL = 100; // ms

function beatsToSeconds(beats: number, bpm: number) {
	return (60 / Math.max(bpm, 1)) * Math.max(0, beats);
}

function secondsToBeats(seconds: number, bpm: number) {
	return (Math.max(0, seconds) / 60) * Math.max(bpm, 1);
}

export function createDefaultScheduler(): SchedulerState {
	return {
		events: [],
	}
}

export class Scheduler {
	constructor(audio: AudioEngine = new AudioEngine(), timeline: MusicEvent[]) {
		this.audio = audio;
		this.timeline = timeline;
	}

	private readonly audio: AudioEngine;
	private readonly timeline: MusicEvent[];
	private interval?: NodeJS.Timeout;

	get state(): SchedulerState {
		return {
			events: this.timeline,
		};
	}

	start() {
		this.audio.start();
		this.interval = setInterval(() => this.schedule(), CLOCK_INTERVAL);
	}

	stop() {
		this.audio.stop();
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
	}

	reset() {
		this.audio.stop();
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
	}

	schedule() {
		for (const event of this.timeline) {
			this.audio.play(event, beatsToSeconds(event.beat, 120)); // need BPM
		}
	}
}
