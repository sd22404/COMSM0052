import { AudioEngine } from "@/audio/engine";
import { NoteEvent } from "@/common/types";

const SCHEDULE_INTERVAL = 100;

export class Sequencer {
	constructor(event_q: NoteEvent[], audio: AudioEngine = new AudioEngine()) {
		this.event_q = event_q;
		this.audio = audio;
	}

	private readonly audio: AudioEngine;
	private readonly event_q: NoteEvent[];
	private interval?: ReturnType<typeof setInterval>;

	private schedule() {
		while (this.event_q.length > 0) {
			const event = this.event_q.shift();
			if (!event) return;
			this.play(event);
		}
	}

	private play(event: NoteEvent) {
		this.audio.play(event);
	}

	run() {
		if (this.interval) return;
		this.audio.start();
		this.interval = setInterval(() => this.schedule(), SCHEDULE_INTERVAL);
	}

	halt() {
		if (!this.interval) return;
		clearInterval(this.interval);
		this.interval = undefined;
		this.audio.stop();
	}
}
