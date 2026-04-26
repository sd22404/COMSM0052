import { CodeLesson } from "@/common/types";

export const CODE_LESSONS: CodeLesson[] = [
	{
		id: "play-and-rest",
		title: "Lesson 1: Play and Rest",
		steps: [
			{
				title: "The Lesson Panel",
				type: "guide",
				body: "This is the lesson panel. Read the current step here, move with Back and Next, and use the status panel above to see when the lesson is ready to finish.",
				bullets: [
					"The status panel shows the lesson number, step number, and whether the lesson is complete.",
					"`Continue` stays disabled until you reach the last step and load all required cores.",
					"`Reset Lesson` restarts the current lesson and resets any changed code.",
				],
				spotlightTargets: ["tutorial-status"],
			},
			{
				title: "Music Machine Programs",
				type: "concept",
				body: "A program is a list of instructions. They are read and executed one at a time, starting from the top. When the end of the program is reached, it starts again from the top.",
				bullets: [
					"Each instruction can play a note, change values, or control the execution of future instructions.",
					"Instructions can have a number of `operands` that give more information about what the instruction should do. These are values that come after the instruction name, each separated by a space.",
					"Comments start with a semicolon and are ignored by the program. Use them to write notes to yourself or explain your code.",
				],
				spotlightTargets: ["core-0-editor"],
			},
			{
				title: "Music Machine Cores",
				type: "concept",
				body: "A core has its own program and registers.", // TODO: expand
				bullets: [
					"Cores can be enabled or disabled by clicking the `IDLE` or `ACTIVE` badge next to their name.",
					"A core's other badges show whether the code is unloaded (you've made changes), invalid (syntax error), or faulted (runtime error).",
					"Press `Ctrl+Enter` inside a core's editor to apply code changes and enable the core (`Cmd+Enter` on Mac). Use `Start Audio` when you're ready to hear enabled cores.",
					"While a core is running, you can still edit its code. Just remember to load it again to apply your changes.",
				],
				spotlightTargets: ["core-0"],
			},
			{
				title: "The Master Controls Panel",
				type: "guide",
				body: "The master controls panel controls the global volume and bpm that all cores run on. In Music Machine, each beat is divided into 4 ticks.",
				bullets: [
					"BPM sets the speed of the global clock. The default is 120 BPM, which means 2 beats (or 8 ticks) per second.",
					"VOL sets the master volume, a value from 0 to 100.",
					"`Start Audio` starts all enabled cores from the top of their program.",
					"`Stop Audio` halts playback and resets playback position to the top of each program.",
					"`Reset` halts and disables all cores, resets the state of registers, and memory.",
				],
				spotlightTargets: ["controls"],
			},
			{
				title: "PLAY Syntax",
				type: "syntax",
				body: "The `PLAY` instruction creates a note at the core's current tick. It does not advance time by itself, so a repeating program also needs a `REST`.",
				bullets: [
					"Syntax: `PLAY DEVICE pitch (duration)`.",
					"`DEVICE` can be `SYNTH`, `DRUMS`, `BASS`, or `PIANO`.",
					"`pitch` can be a MIDI note value from 0 to 127.",
					"`duration` is an optional number of ticks and defaults to 1.",
				],
				code: `PLAY PIANO 60 ; play middle C for one tick,
PLAY SYNTH 64 2 ; play E4 for two ticks`,
			},
			{
				title: "REST Syntax",
				type: "syntax",
				body: "The `REST` instruction moves the current core forward by a positive number of ticks. Music Machine uses 4 ticks per beat.",
				bullets: [
					"Syntax: `REST duration`.",
					"`duration` is a positive number of ticks to wait.",
					"A rest length of 0 or less faults the current core.",
				],
				code: `REST 4 ; wait one beat before the next note
REST 2 ; wait half a beat before the next note`,
			},
			{
				title: "Your Task",
				type: "task",
				body: "Fill in the missing note value and rest duration, then load Core 0.",
				bullets: [
					"Replace `NOTE` with a MIDI note number from 0 to 127.",
					"Replace `TICKS` with a positive duration.",
					"Load the core with Ctrl+Enter (or Cmd+Enter) after both placeholders are filled in.",
				],
			},
		],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 1: play, rest, repeat
; this is a comment, and doesn't affect the program
PLAY PIANO NOTE ; replace NOTE with a MIDI note number, like 52
REST TICKS ; replace TICKS with 4 for one beat`,
			},
		],
	},
	{
		id: "shape-with-registers",
		title: "Lesson 2: Shape Sound With Registers",
		steps: [
			{
				title: "The Register Panel",
				type: "guide",
				body: "Each core has a register panel, which shows the live register values for that core. Keep an eye on it when the lesson asks you to shape the sound or experiment while playback is running.",
				bullets: [
					"The sound-shaping registers and the general-purpose registers all live here.",
					"You can type into registers while the program is running to update their values.",
				],
				spotlightTargets: ["core-0-registers"],
			},
			{
				title: "Register Roles",
				type: "concept",
				body: "Registers are small storage areas inside one core. Some registers control sound, and others are free for your own use.",
				bullets: [
					"`VOL` sets the volume of that core.",
					"`PAN` moves the sound output to the left or right audio channels.",
					"`ATK` and `REL` change how smoothly notes begin and end.",
					"`REG0` through `REG3` are general-purpose registers for your own program logic.",
					"`RAND` is a special register that generates random numbers. You'll use it in Lesson 3.",
				],
			},
			{
				title: "LOAD Syntax",
				type: "syntax",
				body: "`LOAD` writes a value into a register. The destination must be a register name.",
				bullets: [
					"Syntax: `LOAD register value`.",
					"The value can be a number, another register, or a memory read (you'll see this in lesson 4).",
				],
				code: `LOAD VOL 80 ; set volume to 80 percent
LOAD PAN -20 ; move sound to the left
LOAD REG0 64 ; set general-purpose REG0 to 64`,
			},
			{
				title: "Your Task",
				type: "task",
				body: "Fill in the missing register values, then load Core 0 and listen to the three devices.",
				bullets: [
					"Use `VOL` values between 0 and 100.",
					"Use negative `PAN` values for left and positive values for right.",
					"Try short ATK and REL values for a plucky sound, and longer values for a smoother sound.",
					"Load Core 0 and listen to how the three devices respond.",
				],
			},
		],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 2: shaping sounds
LOAD VOL LOUDNESS ; core volume from 0 to 100
LOAD PAN STEREO ; left and right stereo panning from -100 to 100
LOAD ATK ATTACK ; note attack time in milliseconds
LOAD REL RELEASE ; note release time in milliseconds

PLAY SYNTH 52
REST 2
PLAY BASS 40
REST 2
PLAY PIANO 52
REST 4`,
			},
		],
	},
	{
		id: "random-patterns-and-durations",
		title: "Lesson 3: Random Patterns And Durations",
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
				title: "Optional Duration Syntax",
				type: "syntax",
				body: "The `PLAY` instruction can be given a third value for note duration. This can be a number, register, or memory read.",
				bullets: [
					"Syntax: `PLAY DEVICE pitch (duration)`.",
					"`PLAY SYNTH 52 4` plays pitch 52 for 4 ticks.",
					"The duration must be positive when the instruction runs.",
				],
			},
			{
				title: "Building a Pitch",
				type: "system",
				body: "This lesson copies a base pitch into `REG0`, then adds a random offset.",
				bullets: [
					"`LOAD REG0 REG2` copies the base pitch.",
					"`ADD REG0 RAND` adds a newly generated random offset.",
					"`PLAY SYNTH REG0 LENGTH` uses a register value for the pitch.",
				],
			},
			{
				title: "Your Task",
				type: "task",
				body: "Choose a random range and note length, then load Core 0.",
				bullets: [
					"Replace `RANGE` with the number of random notes to choose from.",
					"Replace `LENGTH` with a positive note duration in ticks.",
					"Listen for the melody changing each time the program repeats.",
				],
			},
		],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 3: random notes
LOAD RAND RANGE ; replace RANGE with an upper bound, such as 4
LOAD REG2 60 ; base pitch

LOAD REG0 REG2
ADD REG0 RAND ; add a fresh random offset to the base pitch
PLAY SYNTH REG0 LENGTH ; replace LENGTH with a duration in ticks
REST 4 ; one beat (4 ticks = 1 beat)
`,
			},
		],
	},
	{
		id: "memory-and-register-values",
		title: "Lesson 4: Memory",
		steps: [
			{
				title: "The Memory panel",
				type: "guide",
				body: "This panel is where the machine's memory lives. It is divided into 32 numbered boxes that all cores can read and write to.",
				bullets: [
					"Each box is one memory address, and can hold a single value.",
					"Reads and writes will highlight here while the program runs.",
					"You can type into memory cells while the program is running to change their values.",
				],
				spotlightTargets: ["memory"],
			},
			{
				title: "Direct Memory Reads",
				type: "syntax",
				body: "Square brackets around a value read from that address in memory. A number inside brackets means a direct address.",
				bullets: [
					"Syntax: `[address]`.",
					"`[12]` reads the value stored in memory cell 12.",
					"`PLAY PIANO [12]` plays whatever pitch number is currently stored at address 12.",
				],
				code: `PLAY PIANO [12]
REST 2`,
			},
			{
				title: "Register-held Addresses",
				type: "syntax",
				body: "A register inside square brackets is used as an address. The value in the register is read first, then that value is used to address memory.",
				bullets: [
					"`[REG0]` reads the number in `REG0`, then uses that number as the memory address.",
					"If `REG0` holds 16, `[REG0]` reads memory cell 16.",
				],
				code: `LOAD REG0 16
PLAY SYNTH [REG0]`,
			},
			{
				title: "STORE Syntax",
				type: "syntax",
				body: "`STORE` writes a value into shared memory. Its first operand is an address, the second is the value to write.",
				bullets: [
					"Syntax: `STORE address value`.",
					"`STORE 12 64` writes 64 into memory cell 12.",
					"`STORE REG0 REG1` writes the value in `REG1` to the address held in `REG0`.",
					"Reading or writing outside 0-31 is a runtime fault for the current core.",
				],
			},
			{
				title: "Your Task",
				type: "task",
				body: "Store a note in memory, then play it twice using both addressing forms.",
				bullets: [
					"Replace `ADDRESS` with 12 so the direct read and register-held read point at the same cell.",
					"Replace `NOTE` with a MIDI note number such as 64.",
					"Load Core 0 and watch the write and reads highlight as they happen.",
					"While it plays, type a different number into address 12 to hear future reads change.",
				],
			},
		],
		visiblePanels: ["controls", "memory"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 4: write and read shared memory
LOAD REG0 ADDRESS ; replace ADDRESS with 12 for this exercise
LOAD REG1 NOTE ; replace NOTE with a MIDI note, such as 64
STORE REG0 REG1 ; writes the value in REG1 into the address held by REG0

PLAY PIANO [12] ; direct memory read
REST 2
PLAY SYNTH [REG0] ; register-held memory read
REST 2`,
			},
		],
	},
	{
		id: "loops-and-branches",
		title: "Lesson 5: Loops And Jumps",
		steps: [
			// {
			// 	title: "Counters and Pointers",
			// 	type: "concept",
			// 	body: "A register can count repetitions or point at a memory address. This lesson uses one register for each job.",
			// 	bullets: [
			// 		"`REG0` starts at memory address 8 and moves through the melody.",
			// 		"`REG1` starts at 4 and counts how many notes are left.",
			// 		"Memory cells 8 through 11 already contain a melody.",
			// 		"You can type into those memory cells during playback to change the melody without reloading code.",
			// 	],
			// },
			{
				title: "ADD Syntax",
				type: "syntax",
				body: "`ADD` changes a register by adding another value to it.",
				bullets: [
					"Syntax: `ADD register value`.",
					"`ADD REG0 1` adds 1 to `REG0`.",
					"Negative numbers can be used for subtraction: `ADD REG1 -1`.",
					"The value can be a number, register, or memory read.",
				],
			},
			{
				title: "Labels and JUMP Syntax",
				type: "syntax",
				body: "A label names a position in the program, and `JUMP` will 'jump' the execution to that label.",
				bullets: [
					"Syntax: `name:` declares a label.",
					"Syntax: `JUMP label` always sends execution to that label.",
					"Labels themselves do not play sound or advance time.",
				],
				code: `loop:
REST 2
JUMP loop`,
			},
			{
				title: "JMPZ Syntax",
				type: "syntax",
				body: "`JMPZ` is a conditional jump. It jumps only when a register currently holds zero.",
				bullets: [
					"Syntax: `JMPZ register label`.",
					"`JMPZ REG1 reset` jumps to `reset` if `REG1` is zero.",
					"If the register is not zero, the next instruction runs normally.",
				],
			},
			{
				title: "What This Program Does",
				type: "system",
				body: "The loop plays the memory value at `[REG0]`, moves to the next address, counts down, and either restarts or keeps looping.",
				bullets: [
					"As the program runs, `REG0` moves through memory addresses 8 to 11, playing each note.",
					"`REG1` counts down from 4 to 0, then `JMPZ` sends execution to the `reset` label if `REG1` is zero.",
				],
			},
			{
				title: "Your Task",
				type: "task",
				body: "Finish the stepping and loop target so the melody cycles through memory cells 8 to 11.",
				bullets: [
					"Replace `STEP` with the number of memory addresses to move each note.",
					"Replace `TARGET` with the label that keeps the loop running.",
					"Load Core 0 after the program compiles.",
				],
			},
		],
		visiblePanels: ["controls", "memory"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 5: finish the loop logic
LOAD REG0 8
LOAD REG1 4

top:
PLAY PIANO [REG0]
REST 2
ADD REG0 STEP ; replace STEP with the number of steps to take through memory
ADD REG1 -1
JMPZ REG1 reset
JUMP TARGET ; replace TARGET with the label that keeps the loop going

reset:
LOAD REG0 8
LOAD REG1 4
JUMP top`,
			},
		],
	},
	{
		id: "multi-core-drum-arrangement",
		title: "Lesson 6: Multi-Core Drum Arrangement",
		steps: [
			{
				title: "A Second Core",
				type: "guide",
				body: "This lesson uses two cores at the same time. Core 1 handles the drum beat while Core 0 reads the shared melody note.",
				bullets: [
					"Core 1 has its own editor and registers, just like Core 0.",
					"Both required cores must be loaded before this lesson can finish.",
				],
				spotlightTargets: ["core-1"],
			},
			{
				title: "Core Coordination",
				type: "concept",
				body: "Each core has private registers, but all cores share memory. That makes memory useful for passing musical values between parts.",
				bullets: [
					"Core 1 writes a melody note into memory cell 12.",
					"Core 0 reads memory cell 12 and plays it.",
					"The two cores stay aligned because they both run on the same global tick clock.",
				],
			},
			{
				title: "Drum Notes",
				type: "syntax",
				body: "`PLAY DRUMS note` uses drum samples rather than a pitched synthesised sound.",
				bullets: [
					"The default drum notes are 60 for kick, 61 for snare, and 62 for hi-hat.",
					"If note 63 is mapped to a sample, `PLAY DRUMS 63` triggers that sound.",
				],
			},
			{
				title: "Drum Note Map",
				type: "guide",
				body: "This panel is where you map those samples to MIDI note numbers for use with `PLAY DRUMS`.",
				bullets: [
					"Assign a sample to the extra drum note that the task asks for.",
					"After a note is mapped here, `PLAY DRUMS` with that note will trigger the chosen sample.",
				],
				spotlightTargets: ["samples"],
			},
			{
				title: "Your Task",
				type: "task",
				body: "Complete both cores, map a new drum note, and load the arrangement.",
				bullets: [
					"Assign a sample to MIDI note 63 in the Drum Note Map.",
					"Replace `LENGTH` with 2 in Core 0.",
					"Replace `NOTE` with the MIDI pitch Core 0 should play.",
					"Replace `DRUMNOTE` with 63, then load both cores.",
				],
			},
		],
		visiblePanels: ["controls", "memory", "samples"],
		cores: [
			{
				coreID: 0,
				starterCode: `; Lesson 6, core 0: melody
PLAY PIANO [12] LENGTH ; replace LENGTH with 2 ticks
REST 4`,
			},
			{
				coreID: 1,
				starterCode: `; Lesson 6, core 1: drum beat and shared note
STORE 12 NOTE ; replace NOTE with the MIDI pitch core 0 should play

PLAY DRUMS 60
REST 2
PLAY DRUMS DRUMNOTE ; assign this note in the Drum Note Map first
REST 2`,
			},
		],
	},
];
