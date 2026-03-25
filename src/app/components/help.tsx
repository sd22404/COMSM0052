export default function Help() {
	return (
		<div className="overflow-scroll flex flex-col gap-8 p-4">
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-[120%]">Overview</h1>
				<span>Press the play button to begin looping over your code. Code can be updated during playback by making changes in the editor and then pressing CTRL+ENTER.</span>
				<span>Your code is executed on a virtual machine that turns it into sound events.</span>
				<span>On the right is a view of the VM's registers and memory which can be edited via code or by typing in the boxes.</span>
				<span>Use the "Toggle Note View" button to switch memory cells between MIDI and A-G view.</span>
				<span>PLAY instructions take one beat to execute, REST instructions take a specified number of beats.</span>
				<span>Instruction arguments can be specified in four ways: directly by MIDI note number, by the value in a register, by a direct memory access, or by indirect memory access (using the value in a register).</span>
				<span>Direct Memory: [<em>number</em>], Indirect Memory: [<em>register</em>]</span>
				<span>The example code demonstrates most of the available instructions.</span>
			</div>
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-[120%]">Code Controls</h1>
				<span><strong>CTRL+ENTER</strong>: Update code.</span>
				<span><strong>CTRL+/</strong>: Comment out the current line.</span>
			</div>
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-[120%]">Drum Sample Map</h1>
				<span><strong>60</strong>: Kick Drum</span>
				<span><strong>61</strong>: Snare Drum</span>
				<span><strong>62</strong>: Hi-Hat</span>
			</div>
			{/* <div className="flex flex-col gap-2">
				<h1 className="font-bold text-[120%]">Instruments</h1>
				<span><strong>DRUMS</strong>: A drum machine with kick, snare, and hat samples.</span>
				<span><strong>SYNTH</strong>: A single oscillator that can play any MIDI note.</span>
			</div>
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-[120%]">Syntax</h1>
				<span><strong>"TRACK <em>trackname</em>:"</strong>: Define a track that executes in parallel with other tracks.</span>
			</div> */}
		</div>
	);
}
