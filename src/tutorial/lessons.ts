import { CodeLesson, TourStep } from "@/common/types";

export const TOUR_STEPS: TourStep[] = [
	{
		id: "welcome",
		title: "Welcome",
		text: "Music Machine is a live coding environment for creating music while learning about assembly-level programming.\n\nThis tutorial starts with a short tour of the interface, then moves into hands-on lessons which introduce what you can do with Music Machine.",
		buttonText: "Start the tour",
	},
	{
		id: "core-grid",
		title: "Cores",
		anchorID: "core-0",
		text: "Each core runs an independent program that is synchronised to the global beat.\n\nUse separate cores to layer melody, rhythm, or shared logic. The status pills show whether a core is active, invalid, faulted, or has edits waiting to load.",
	},
	{
		id: "editor",
		title: "Code Editor",
		anchorID: "core-0-editor",
		text: "This is where you write code for a single core.\n\nPress Ctrl+Enter to compile and load the current text into that core. When playback is running, the active instructions are highlighted in the editor.",
	},
	{
		id: "registers",
		title: "Registers",
		anchorID: "core-0-registers",
		text: "Registers hold private values for one core.\n\nVOL and PAN shape the sound, ATK through REL shape the envelope, and REG0 through REG3 are general-purpose values for your own program logic. RAND is a special register that generates a random number less than its value when read.",
	},
	{
		id: "controls",
		title: "Master Controls",
		anchorID: "controls",
		side: "left",
		text: "These controls affect the whole machine.\n\nUse BPM and VOL to set global tempo and volume, Start or Stop Audio to control playback, Reset to stop and go back to the beginning, and Help for a quick syntax reference.",
	},
	{
		id: "memory",
		title: "Shared Memory",
		anchorID: "memory",
		side: "left",
		text: "Memory is shared across all cores.\n\nPrograms can STORE values here and read them back later with [address] or [register]. Valid addresses are 0-31; reading or writing outside that range faults the current core.",
	},
	{
		id: "samples",
		title: "Drum Map",
		anchorID: "samples",
		side: "left",
		text: "The drum map controls which note numbers trigger which drum sounds.\n\nThe default pattern is 60 for kick, 61 for snare, and 62 for hi-hat, but you can assign any built-in sample to any MIDI note.",
	},
	{
		id: "tour-finish",
		title: "Ready for the lessons",
		text: "The next phase switches to structured exercises. Music Machine measures time in ticks: each beat is divided into 4 ticks.\n\nEach lesson contains starter code with missing pieces. Fill those gaps, load the result, and Continue will unlock once the lesson code compiles successfully.",
		buttonText: "Begin lesson 1",
	},
];

export const CODE_LESSONS: CodeLesson[] = [
	{
		id: "play-and-rest",
		title: "Lesson 1: Play, Rest, And Ticks",
		instructions: [
			"Replace NOTE with a MIDI note number such as 60.",
			"Replace TICKS with a positive rest length. Use 4 for one beat.",
			"Load core 0 once the program compiles.",
		],
		hints: [
			"Middle C is 60.",
			"Each beat is divided into 4 ticks, so REST 4 waits for exactly one beat.",
			"JUMP loop sends execution back to the label named loop.",
		],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 1: play, rest, repeat
; Music Machine divides each beat into 4 ticks.
loop:
PLAY PIANO NOTE ; replace NOTE with a MIDI note number, like 60
REST TICKS ; replace TICKS with 4 for one beat
JUMP loop`,
			},
		],
	},
	{
		id: "shape-with-registers",
		title: "Lesson 2: Shape Sound with Registers",
		instructions: [
			"Replace the missing VOL, PAN, ATK, DEC, SUS, and REL values.",
			"Listen for the difference between SYNTH, BASS, and PIANO.",
			"Load core 0 after the code is valid.",
		],
		hints: [
			"VOL and SUS are useful between 0 and 100.",
			"PAN uses negative values for left and positive values for right.",
			"ATK, DEC, and REL are envelope times in milliseconds.",
		],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 2: shape three instruments
LOAD VOL LOUDNESS ; replace LOUDNESS with a number from 0 to 100
LOAD PAN STEREO ; replace STEREO with -100 to 100
LOAD ATK ATTACK ; attack time in milliseconds
LOAD DEC DECAY ; decay time in milliseconds
LOAD SUS SUSTAIN ; sustain level from 0 to 100
LOAD REL RELEASE ; release time in milliseconds

loop:
PLAY SYNTH 64 2
REST 2
PLAY BASS 40 2
REST 2
PLAY PIANO 67 4
REST 4
JUMP loop`,
			},
		],
	},
	{
		id: "memory-and-register-values",
		title: "Lesson 3: Memory And Register Values",
		instructions: [
			"Replace ADDRESS with a valid memory cell from 0 to 31.",
			"Replace NOTE with a MIDI note to store at that address.",
			"Load core 0 and watch the memory panel highlight reads and writes.",
		],
		hints: [
			"Address 12 is unused by the default melodies.",
			"STORE REG0 REG1 writes to the memory address held in REG0.",
			"[12] reads a direct address, while [REG0] reads the address held in a register.",
		],
		visiblePanels: ["controls", "memory"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 3: write and read shared memory
LOAD REG0 ADDRESS ; replace ADDRESS with a memory cell, such as 12
LOAD REG1 NOTE ; replace NOTE with a MIDI note, such as 64
STORE REG0 REG1 ; writes REG1 into the address held by REG0

loop:
PLAY PIANO [12] ; direct memory read
REST 2
PLAY SYNTH [REG0] ; register-held memory read
REST 2
JUMP loop`,
			},
		],
	},
	{
		id: "loops-and-branches",
		title: "Lesson 4: Loops And Branches",
		instructions: [
			"Fill STEP so REG0 advances through the melody in memory.",
			"Replace TARGET with the label that keeps the loop running.",
			"Load core 0 after the program compiles.",
		],
		hints: [
			"The default melody notes live in memory cells 8 through 11.",
			"REG1 counts down with ADD REG1 -1.",
			"JMPZ REG1 restart jumps only when REG1 reaches zero.",
		],
		visiblePanels: ["controls", "memory"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 4: finish the loop logic
LOAD REG0 8
LOAD REG1 4

loop:
PLAY PIANO [REG0]
REST 2
ADD REG0 STEP ; replace STEP with the number of steps to take through memory
ADD REG1 -1
JMPZ REG1 restart
JUMP TARGET ; replace TARGET with the label that keeps the loop going

restart:
LOAD REG0 8
LOAD REG1 4
JUMP loop`,
			},
		],
	},
	{
		id: "random-patterns-and-durations",
		title: "Lesson 5: Random Patterns And Durations",
		instructions: [
			"Replace RANGE with the number of random notes to choose from.",
			"Replace LENGTH with a note duration in ticks.",
			"Load core 0 and listen for the melody to vary each loop.",
		],
		hints: [
			"RAND returns a random number from 0 up to one less than its stored value.",
			"REG0 holds the generated pitch, REG1 holds the note duration, REG2 holds the base pitch, and REG3 holds the rest length.",
			"PLAY SYNTH REG0 REG1 uses REG1 as the optional duration operand.",
		],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 5: random notes with explicit durations
LOAD RAND RANGE ; replace RANGE with a random bound, such as 5
LOAD REG2 60 ; base pitch
LOAD REG3 4 ; one beat, because 4 ticks = 1 beat

loop:
LOAD REG0 REG2
ADD REG0 RAND ; add a fresh random offset to the base pitch
LOAD REG1 LENGTH ; replace LENGTH with a duration in ticks
PLAY SYNTH REG0 REG1
REST REG3
JUMP loop`,
			},
		],
	},
	{
		id: "multi-core-drum-arrangement",
		title: "Lesson 6: Multi-Core Drum Arrangement",
		instructions: [
			"Assign a sample to MIDI note 63 in the Drum Note Map.",
			"Complete both cores: core 0 reads memory cell 12, and core 1 writes that cell.",
			"Replace DRUMNOTE with 63, then load both cores.",
		],
		hints: [
			"Defaults are 60 Kick, 61 Snare, and 62 Hi-Hat.",
			"Core 1 writes the shared melody note before triggering the drum pattern.",
			"The sample-map task is not checked by Continue, so do it before loading DRUMNOTE.",
		],
		visiblePanels: ["controls", "memory", "samples"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 6, core 0: melody lane
loop:
PLAY PIANO [12] LENGTH ; replace LENGTH with 4 ticks
REST 4
JUMP loop`,
			},
			{
				coreID: 1,
				starterCode: `; Lesson 6, core 1: drum beat and shared note
LOAD REG0 NOTE ; replace NOTE with the MIDI pitch core 0 should play

loop:
STORE 12 REG0
PLAY DRUMS 60
REST 2
PLAY DRUMS DRUMNOTE ; assign this note in the Drum Note Map first
REST 2
JUMP loop`,
			},
		],
	},
];
