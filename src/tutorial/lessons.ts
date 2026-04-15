import { Lesson } from "@/common/types";

export const LESSONS: Lesson[] = [
	{
		title: "Welcome",
		text: "This walkthrough introduces the main parts of the interface.\n\nYou will see where to write programs, how to control playback, and where shared state lives while the music machine runs.",
		buttonText: "Show me around",
	},
	{
		title: "Core Grid",
		anchorID: "core-0",
		text: "Each core is an independent program lane.\n\nUse different cores to layer parts such as melody, drums, or harmony. The pills at the top summarize whether a core is active, invalid, faulted, or has edits waiting to load.",
	},
	{
		title: "Code Editor",
		anchorID: "core-0-editor",
		text: "The editor is where you write a core's program.\n\nPress Ctrl+Enter to compile and load the current text into that core. While the machine runs, code highlighting follows the instruction currently being executed.",
	},
	{
		title: "Registers",
		anchorID: "core-0-registers",
		text: "The register panel is the core's private working state.\n\nVOL, PAN, ATK, DEC, SUS, and REL shape playback, while RAND and REG0-REG3 are useful for program logic. Blue and peach highlights show reads and writes during execution.",
	},
	{
		title: "Master Controls",
		anchorID: "controls",
		side: "left",
		text: "These controls affect the whole machine.\n\nBPM sets the global tempo, VOL sets the master output level, Start or Stop toggles audio playback, Reset restores runtime state, and Help opens a quick reference for the interface and language.",
	},
	{
		title: "Shared Memory",
		anchorID: "memory",
		side: "left",
		text: "Memory is shared across all cores.\n\nPrograms can STORE values here and later read them back to coordinate behaviour between lanes. You can also edit cells manually and switch between number view and note-name view.",
	},
	{
		title: "Drum Note Map",
		anchorID: "samples",
		side: "left",
		text: "This panel shows which drum note numbers trigger which sounds.",
	},
	{
		title: "Start Experimenting",
		text: "A good first test is to change a REST length, register value, or memory cell, then load the updated core and listen for the result.\n\nOnce you are comfortable with one lane, turn on multiple cores together to build a full pattern.",
		buttonText: "Finish",
	},
];
