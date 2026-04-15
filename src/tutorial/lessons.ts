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
		text: "Memory is shared across all cores.\n\nPrograms can STORE values here and read them back later with [address] or [register]. That is how separate cores coordinate with each other.",
	},
	{
		id: "samples",
		title: "Drum Map",
		anchorID: "samples",
		side: "left",
		text: "The drum map shows which note numbers trigger which drum sounds.",
		//\n\nYou will use it later when you combine a melody core with a drum core in the final lesson.",
	},
	{
		id: "tour-finish",
		title: "Ready for the lessons",
		text: "The next phase switches to structured exercises.\n\nEach lesson contains starter code with missing pieces. Fill those gaps, load the result, and Continue will unlock once the lesson code compiles successfully.",
		buttonText: "Begin lesson 1",
	},
];

export const CODE_LESSONS: CodeLesson[] = [
	{
		id: "play-and-rest",
		title: "Lesson 1: Play and Rest",
		summary: "Load a simple loop, choose a note, and decide how long the core should wait between repeats.",
		concept: "PLAY makes a sound and REST waits for a number of ticks.",
		instructions: [
			"Replace the missing pitch with a MIDI note number such as 60.",
			"Replace the missing rest length with a positive number of ticks.",
			"Load core 0 once the program compiles.",
		],
		hints: [
			"Middle C is 60.",
			"Each beat is divided into 4 ticks, so REST 4 waits for one beat.",
		],
		requiredCoreIDs: [0],
		visibleCoreIDs: [0],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				title: "Core 0",
				description: "Add the first note and rest values, then load the loop.",
				starterCode: `; Lesson 1: finish the missing values
loop:
PLAY PIANO NOTE ; replace NOTE with a MIDI note number (0 - 127)
REST LENGTH ; and LENGTH with a positive number of ticks
JUMP loop`,
			},
		],
		successText: "Core 0 has a valid program loaded. Continue is now unlocked.",
	},
	{
		id: "shape-with-registers",
		title: "Lesson 2: Shape Sound with Registers",
		summary: "Use registers to change how the synth sounds before it plays.",
		concept: "LOAD writes values into registers like VOL, PAN, ATK, and REL.",
		instructions: [
			"Replace the missing register values with numbers that shape the sound.",
			"Load core 0 after the code is valid.",
			"Try different values before you continue so you can hear the effect.",
		],
		hints: [
			"PAN ranges from left to right with negative and positive numbers.",
			"Short attack and release values make the note tighter.",
		],
		requiredCoreIDs: [0],
		visibleCoreIDs: [0],
		visiblePanels: ["controls"],
		cores: [
			{
				coreID: 0,
				title: "Core 0",
				description: "Fill the sound-shaping register values, then load the loop.",
				starterCode: `; Lesson 2: use registers to shape a synth note
LOAD VOL LOUDNESS ; replace LOUDNESS with a number from 0 to 100
LOAD PAN STEREO ; and STEREO with a number from -100 (left) to 100 (right)
LOAD ATK ATTACK ; how long it takes for the note to reach full volume in milliseconds
LOAD REL RELEASE ; how long it takes for the note to fade out after releasing in milliseconds

loop:
PLAY SYNTH 64
REST 4
JUMP loop`,
			},
		],
		successText: "Core 0 compiled and loaded with your register choices.",
	},
	{
		id: "loops-and-branches",
		title: "Lesson 3: Loops and Branches",
		summary: "Step through a short melody in memory and loop back once the counter reaches zero.",
		concept: "ADD updates registers, JMPZ branches on zero, and JUMP keeps the loop moving.",
		instructions: [
			"Fill the increment that advances REG0 through memory.",
			"Replace the missing jump target so the loop continues correctly.",
			"Load core 0 after the program compiles.",
		],
		hints: [
			"The default melody notes live in memory cells 8 through 11.",
			"REG1 already counts down toward zero.",
		],
		requiredCoreIDs: [0],
		visibleCoreIDs: [0],
		visiblePanels: ["controls", "memory"],
		cores: [
			{
				coreID: 0,
				title: "Core 0",
				description: "Complete the loop logic so the melody walks through memory repeatedly.",
				starterCode: `; Lesson 3: finish the loop logic
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
		successText: "Core 0 compiled and loaded with a working branch structure.",
	},
	{
		id: "shared-memory",
		title: "Lesson 4: Shared Memory",
		summary: "Write a note into shared memory, then read it back from the same core.",
		concept: "STORE writes into global memory and [address] reads it back later.",
		instructions: [
			"Replace the missing address with the memory cell that should hold the note.",
			"Load core 0 once the program compiles.",
			"Watch the memory panel while the program runs to see the read and write highlights.",
		],
		hints: [
			"Address 12 is unused by the default melodies, so it is a good one to use.",
		],
		requiredCoreIDs: [0],
		visibleCoreIDs: [0],
		visiblePanels: ["controls", "memory"],
		cores: [
			{
				coreID: 0,
				title: "Core 0",
				description: "Store a note in shared memory, then play it back from that address.",
				starterCode: `; Lesson 4: write a note into shared memory
LOAD REG0 72

loop:
STORE ADDRESS REG0
PLAY PIANO [12]
REST 4
JUMP loop`,
			},
		],
		successText: "Core 0 compiled and loaded with a shared-memory read/write loop.",
	},
	{
		id: "two-core-arrangement",
		title: "Lesson 5: Two-Core Arrangement",
		summary: "Use one core for melody and one for drums, with shared memory connecting them.",
		concept: "Multiple cores can run together, and memory lets them share musical state.",
		instructions: [
			"Complete both visible cores.",
			"Core 1 should write a note into memory cell 12 and trigger a drum pattern.",
			"Load both cores. Continue unlocks only after both programs compile and load.",
		],
		hints: [
			"Kick is note 60 and hi-hat is note 62.",
			"Core 0 already reads memory cell 12.",
		],
		requiredCoreIDs: [0, 1],
		visibleCoreIDs: [0, 1],
		visiblePanels: ["controls", "memory", "samples"],
		cores: [
			{
				coreID: 0,
				title: "Core 0",
				description: "This melody core plays whatever note lives in memory cell 12.",
				starterCode: `; Lesson 5, core 0: melody lane
loop:
PLAY PIANO [12]
REST 4
JUMP loop`,
			},
			{
				coreID: 1,
				title: "Core 1",
				description: "Write the missing shared-memory note and finish the drum hit.",
				starterCode: `; Lesson 5, core 1: drum beat
LOAD REG0 76

loop:
STORE 12 REG0
PLAY DRUMS 60
REST 2
PLAY DRUMS DRUMNOTE
REST 2
JUMP loop`,
			},
		],
		successText: "Both tutorial cores have valid programs loaded together.",
		continueText: "Finish tutorial",
	},
];
