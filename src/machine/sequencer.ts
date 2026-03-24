import { AudioEngine } from "@/audio/engine";
import { NoteEvent } from "@/common/types";

const SCHEDULE_INTERVAL = 500;

export class Sequencer {
	constructor(event_q: NoteEvent[], audio: AudioEngine = new AudioEngine()) {
		this.event_q = event_q;
		this.audio = audio;
	}

	private audio: AudioEngine;
	private event_q: NoteEvent[];
	private interval?: NodeJS.Timeout;

	private schedule() {
		while (this.event_q.length > 0) {
			const event = this.event_q.shift()!;
			this.play(event);
		}
	}

	private play(event: NoteEvent) {
		this.audio.play(event.instrument, event.pitch, event.duration);
	}

	run() {
		this.audio.start();
		this.interval = setInterval(() => this.schedule(), SCHEDULE_INTERVAL);
	}

	halt() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}

		this.audio.stop();
	}
}
