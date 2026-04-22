import { CodeLesson, TourStep } from "@/common/types";

export const TOUR_STEPS: TourStep[] = [
	{
		id: "welcome",
		title: "Welcome",
		text: "Music Machine is a live coding environment for creating music while learning assembly-level programming.\n\nThe tour introduces the interface first, then the lessons break the language into small pieces: instructions, syntax, values, memory, and timing.",
		buttonText: "Start the tour",
	},
	{
		id: "core-grid",
		title: "Cores",
		anchorID: "core-0",
		text: "Each core runs one independent program.\n\nCores share the same global beat, but each core has its own registers and position in its code. You can use separate cores for melody, drums, bass, or logic that writes to shared memory.",
	},
	{
		id: "machine-time",
		title: "Ticks And Time",
		anchorID: "core-0",
		text: "Music Machine measures time in ticks. One beat is divided into 4 ticks.\n\nMost instructions happen immediately. PLAY queues a note without moving the core forward in time. REST advances that core's time, which is how programs make rhythm and avoid running forever all at once.",
	},
	{
		id: "editor",
		title: "Code Editor",
		anchorID: "core-0-editor",
		text: "This is where you write code for a single core.\n\nPress Ctrl+Enter to compile and load the current text into that core. You can do this during playback to update the core's running program without stopping the whole machine. When playback is running, highlights show which instructions have just been executed.",
	},
	{
		id: "registers",
		title: "Registers",
		anchorID: "core-0-registers",
		text: "Registers are private storage for a core.\n\nVOL and PAN shape loudness and stereo position. ATK, DEC, SUS, and REL shape the envelope. REG0 through REG3 are general-purpose values for your own use as counters, pitches, addresses, and durations. RAND returns a fresh random number when read. You can type into register cells during playback, and later instructions on that core will read the updated values.",
	},
	{
		id: "status",
		title: "Loading And Faults",
		anchorID: "core-0",
		text: "A core can be idle, active, invalid, unloaded, or faulted.\n\nInvalid means the editor text does not compile. Unloaded means the editor has changed since the last successful load. Faulted means the program compiled, but something went wrong while running, such as reading memory outside addresses 0-31.",
	},
	{
		id: "controls",
		title: "Master Controls",
		anchorID: "controls",
		side: "left",
		text: "These controls affect the whole machine.\n\nBPM sets tempo. VOL sets global output volume. Start and Stop Audio control playback. Reset returns memory and each core's registers, tempo, volume, and status to their defaults while keeping their program text.",
	},
	{
		id: "memory",
		title: "Shared Memory",
		anchorID: "memory",
		side: "left",
		text: "Memory is shared by every core.\n\nUse STORE to write values. Use [12] to read a direct memory address, or [REG0] to read the address currently held in REG0. Valid addresses are 0-31, and memory highlights show reads and writes as the machine runs. You can type into memory cells during playback to change values that future memory reads will use.",
	},
	{
		id: "samples",
		title: "Drum Map",
		anchorID: "samples",
		side: "left",
		text: "The drum map controls which MIDI note numbers trigger which drum samples.\n\nThe defaults are 60 for kick, 61 for snare, and 62 for hi-hat. You can assign any built-in sample to another note number and trigger it with PLAY DRUMS.",
	},
	{
		id: "help",
		title: "Help Guide",
		anchorID: "controls",
		side: "left",
		text: "The Help button is a syntax guide and controls reference.\n\nUse it when you want to check an instruction shape, register name, memory-addressing form, or keyboard shortcut without leaving the workspace.",
	},
	{
		id: "tour-finish",
		title: "Ready For Lessons",
		text: "The next phase switches to guided exercises.\n\nEach lesson has small explanation steps. Read through them, edit the starter code, load the required cores, and then continue to the next lesson. If playback is already running, Ctrl+Enter updates the focused core without stopping everything else.",
		buttonText: "Begin lessons",
	},
];

export const CODE_LESSONS: CodeLesson[] = [
	{
		id: "play-and-rest",
		title: "Lesson 1: Play, Rest, And Ticks",
		steps: [
			{
				title: "The shape of a program",
				type: "concept",
				body: "A core reads one instruction at a time from top to bottom. Labels mark places in the program, and jumps can move execution back to a label.",
				bullets: [
					"`loop:` declares a label named loop.",
					"`JUMP loop` sends the instruction pointer back to that label.",
					"The label itself is not an instruction that plays sound or takes time.",
				],
				code: `loop:
PLAY PIANO 60
REST 4
JUMP loop`,
			},
			{
				title: "PLAY syntax",
				type: "syntax",
				body: "`PLAY` creates a note at the core's current tick. It does not advance time by itself, so a loop also needs a `REST`.",
				bullets: [
					"Syntax: `PLAY DEVICE pitch (ticks)`.",
					"`DEVICE` can be `SYNTH`, `DRUMS`, `BASS`, or `PIANO`.",
					"`pitch` can be a number, register, or memory read.",
					"The optional duration defaults to 1 tick when omitted.",
				],
			},
			{
				title: "REST syntax",
				type: "syntax",
				body: "`REST` moves the current core forward by a positive number of ticks. Music Machine uses 4 ticks per beat.",
				bullets: [
					"Syntax: `REST ticks`.",
					"`REST 4` waits one beat.",
					"`REST 2` waits half a beat.",
					"A rest length of 0 or less faults the current core.",
				],
			},
			{
				title: "What the system does",
				type: "system",
				body: "When this loop runs, the core plays a piano note, waits, jumps back to the label, and repeats. The code highlight moves as each instruction executes.",
				bullets: [
					"`PLAY` schedules the note.",
					"`REST` advances the core's tick.",
					"`JUMP` changes which instruction runs next.",
				],
			},
			{
				title: "Your task",
				type: "task",
				body: "Fill in the missing note and rest length, then load core 0.",
				bullets: [
					"Replace `NOTE` with a MIDI note number such as 60.",
					"Replace `TICKS` with a positive rest length. Use 4 for one beat.",
					"Press Ctrl+Enter in the editor to load the core. You can press it again during playback after changing the code.",
				],
			},
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
		title: "Lesson 2: Shape Sound With Registers",
		steps: [
			{
				title: "Registers hold settings",
				type: "concept",
				body: "Registers are named storage cells inside one core. Some registers control sound, and others are free for your program logic.",
				bullets: [
					"`VOL` sets that core's volume before global volume is applied.",
					"`PAN` moves the sound left or right.",
					"`ATK`, `DEC`, `SUS`, and `REL` shape the note envelope.",
					"`REG0` through `REG3` are general-purpose registers.",
				],
			},
			{
				title: "LOAD syntax",
				type: "syntax",
				body: "`LOAD` writes a value into a register. The destination must be a register name.",
				bullets: [
					"Syntax: `LOAD register value`.",
					"`LOAD VOL 80` writes 80 into the `VOL` register.",
					"The value can be a number, another register, or a memory read.",
				],
				code: `LOAD VOL 80
LOAD PAN -20
LOAD REG0 64`,
			},
			{
				title: "Envelope values",
				type: "syntax",
				body: "The envelope registers describe how each played note starts, fades, holds, and releases.",
				bullets: [
					"Attack describes how quickly the note reaches its peak volume when played.",
					"Decay describes how quickly the note falls to the sustain level.",
					"Sustain describes the volume of the note until it is released.",
					"Release describes how quickly the note fades to silence after its duration ends.",
					"`ATK`, `DEC`, and `REL` are times in milliseconds.",
					"`SUS` is a level from 0 to 100.",
				],
			},
			{
				title: "What the system does",
				type: "system",
				body: "When a `PLAY` instruction runs, the core reads its current sound registers and stores those settings on the note event.",
				bullets: [
					"Changing a register affects later notes on that core.",
					"You can type into register cells during playback to try new values without editing the code.",
					"Each core has its own registers, so one core's `VOL` does not change another core.",
					"Register highlights show which settings were read or written.",
				],
			},
			{
				title: "Your task",
				type: "task",
				body: "Fill in the missing register values, then load core 0 and listen to the three devices.",
				bullets: [
					"Use `VOL` and `SUS` values between 0 and 100.",
					"Use negative `PAN` values for left and positive values for right.",
					"Try short and long envelope times to hear the difference.",
					"Press Ctrl+Enter during playback whenever you want to reload the edited code.",
				],
			},
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
		steps: [
			{
				title: "Shared memory",
				type: "concept",
				body: "Memory is a shared row of 32 numbered cells. Every core can read and write it, so memory is how cores can coordinate.",
				bullets: [
					"Valid addresses are integers from 0 to 31.",
					"Each memory cell holds one number.",
					"You can type into memory cells during playback, and future reads will use the new values.",
					"Reads highlight blue, and writes highlight peach.",
				],
			},
			{
				title: "Direct memory reads",
				type: "syntax",
				body: "Square brackets read a value from memory. A number inside the brackets means a direct address.",
				bullets: [
					"Syntax: `[address]`.",
					"`[12]` reads the value stored in memory cell 12.",
					"`PLAY PIANO [12]` plays whatever pitch number is currently stored at address 12.",
				],
				code: `PLAY PIANO [12]
REST 2`,
			},
			{
				title: "Register-held addresses",
				type: "syntax",
				body: "A register inside square brackets is used as an address. The register is read first, then memory is read at that address.",
				bullets: [
					"`[REG0]` does not read memory cell REG0.",
					"It reads the number in `REG0`, then uses that number as the memory address.",
					"If `REG0` holds 12, `[REG0]` reads memory cell 12.",
				],
				code: `LOAD REG0 12
PLAY SYNTH [REG0]`,
			},
			{
				title: "STORE syntax",
				type: "syntax",
				body: "`STORE` writes a value into shared memory. Its first operand is an address, not a memory read.",
				bullets: [
					"Syntax: `STORE address value`.",
					"`STORE 12 64` writes 64 into memory cell 12.",
					"`STORE REG0 REG1` writes the value in `REG1` to the address held in `REG0`.",
					"Reading or writing outside 0-31 faults the current core.",
				],
			},
			{
				title: "Your task",
				type: "task",
				body: "Store a note in memory, then play it twice using both addressing forms.",
				bullets: [
					"Replace `ADDRESS` with 12 so the direct read and register-held read point at the same cell.",
					"Replace `NOTE` with a MIDI note number such as 64.",
					"Load core 0 and watch the memory panel highlight the write and reads.",
					"While it plays, type a different number into memory cell 12 to hear future reads change.",
				],
			},
		],
		visiblePanels: ["controls", "memory"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 3: write and read shared memory
LOAD REG0 ADDRESS ; replace ADDRESS with 12 for this exercise
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
		steps: [
			{
				title: "Counters and pointers",
				type: "concept",
				body: "A register can count repetitions or point at a memory address. This lesson uses one register for each job.",
				bullets: [
					"`REG0` starts at memory address 8 and moves through the melody.",
					"`REG1` starts at 4 and counts how many notes are left.",
					"Memory cells 8 through 11 contain a default melody.",
					"You can type into those memory cells during playback to change the melody without reloading code.",
				],
			},
			{
				title: "ADD syntax",
				type: "syntax",
				body: "`ADD` changes a register by adding another value to it.",
				bullets: [
					"Syntax: `ADD register value`.",
					"`ADD REG0 1` moves `REG0` to the next memory address.",
					"`ADD REG1 -1` counts down by one.",
					"The value can be a number, register, or memory read.",
				],
			},
			{
				title: "JMPZ syntax",
				type: "syntax",
				body: "`JMPZ` is a conditional jump. It jumps only when a register currently holds zero.",
				bullets: [
					"Syntax: `JMPZ register label`.",
					"`JMPZ REG1 restart` jumps to `restart` if `REG1` is zero.",
					"If the register is not zero, the next instruction runs normally.",
				],
			},
			{
				title: "What the system does",
				type: "system",
				body: "The loop plays the memory value at `[REG0]`, moves to the next address, counts down, and either restarts or keeps looping.",
				bullets: [
					"Labels become instruction positions when the program compiles.",
					"`JUMP` always changes the next instruction.",
					"`JMPZ` changes the next instruction only when its test register is zero.",
				],
			},
			{
				title: "Your task",
				type: "task",
				body: "Finish the stepping and loop target so the melody cycles through memory cells 8 to 11.",
				bullets: [
					"Replace `STEP` with the number of memory addresses to move each note.",
					"Replace `TARGET` with the label that keeps the loop running.",
					"Load core 0 after the program compiles.",
				],
			},
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
		steps: [
			{
				title: "RAND as a source value",
				type: "concept",
				body: "`RAND` is a special register. Writing to it sets the range, and reading it produces a fresh random number.",
				bullets: [
					"`LOAD RAND 4` sets the random bound to 4.",
					"Reading `RAND` then returns 0, 1, 2, 3, or 4.",
					"If the bound is 0 or less, reading `RAND` returns 0.",
				],
			},
			{
				title: "Building a pitch",
				type: "system",
				body: "This lesson copies a base pitch into `REG0`, then adds a random offset.",
				bullets: [
					"`LOAD REG0 REG2` copies the base pitch.",
					"`ADD REG0 RAND` adds a newly generated random offset.",
					"`PLAY SYNTH REG0 REG1` uses registers for pitch and duration.",
				],
			},
			{
				title: "Optional duration syntax",
				type: "syntax",
				body: "`PLAY` can take a third operand for note duration. That duration can be a literal number, register, or memory read.",
				bullets: [
					"Syntax: `PLAY DEVICE pitch (ticks)`.",
					"`PLAY SYNTH REG0 REG1` plays pitch `REG0` for `REG1` ticks.",
					"The duration must be positive when the instruction runs.",
				],
			},
			{
				title: "Your task",
				type: "task",
				body: "Choose a random range and note length, then load core 0.",
				bullets: [
					"Replace `RANGE` with the number of random notes to choose from.",
					"Replace `LENGTH` with a positive note duration in ticks.",
					"Listen for the melody changing each time the loop repeats.",
				],
			},
		],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 5: random notes with explicit durations
LOAD RAND RANGE ; replace RANGE with a random bound, such as 4
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
		steps: [
			{
				title: "Cores can coordinate",
				type: "concept",
				body: "Each core has private registers, but all cores share memory. That makes memory useful for passing musical values between parts.",
				bullets: [
					"Core 1 writes a melody note into memory cell 12.",
					"Core 0 reads memory cell 12 and plays it.",
					"The two cores stay aligned because they both run on the same global tick clock.",
				],
			},
			{
				title: "Memory as a message",
				type: "system",
				body: "In this arrangement, `STORE 12 REG0` sends the value in core 1's `REG0` to shared memory.",
				bullets: [
					"Core 1's `REG0` is private to core 1.",
					"Memory address 12 is shared and visible to every core.",
					"Core 0 can use `PLAY PIANO [12]` to read the latest shared value.",
					"You can type into memory or register cells during playback to edit the shared value live.",
				],
			},
			{
				title: "Drum notes",
				type: "syntax",
				body: "`PLAY DRUMS note` uses the drum map rather than a pitched synth voice.",
				bullets: [
					"The default drum notes are 60 for kick, 61 for snare, and 62 for hi-hat.",
					"You can assign another sample to MIDI note 63 in the Drum Note Map.",
					"After mapping it, `PLAY DRUMS 63` triggers that sample.",
				],
			},
			{
				title: "Your task",
				type: "task",
				body: "Complete both cores, map a new drum note, and load the arrangement.",
				bullets: [
					"Assign a sample to MIDI note 63 in the Drum Note Map.",
					"Replace `LENGTH` with 4 in core 0.",
					"Replace `NOTE` with the MIDI pitch core 0 should play.",
					"Replace `DRUMNOTE` with 63, then load both cores.",
				],
			},
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
