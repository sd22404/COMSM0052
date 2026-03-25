import Editor from "./editor";
import Registers from "./registers";
import Memory from "./memory";
import Help from "./help";
import useRuntime from "../hooks/useRuntime";

export default function Environment({ className = "" }: { className: string }) {
	const { runtime: { running, memory, cores }, run, halt, setCode, setMemory } = useRuntime();

	return (
		<div className={`${className}`}>
			<div className="w-full h-full flex flex-1 flex-col gap-8">
				<Editor onCodeChange={setCode} />
			</div>
			<div className="w-full h-full flex flex-1 flex-col gap-8">
				<div className="overflow-auto flex flex-col gap-8 items-end">
					{/* <Registers registers={registers} onRegisterChange={setRegister} /> */}
					<Memory memory={memory} onMemoryChange={setMemory} />
				</div>
				<span className="flex justify-end gap-4">
					<Help />
					<button onClick={running ? halt : run} className={`p-2 min-w-[100px] rounded ${running ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} hover:cursor-pointer`}>
						{running ? "Stop Audio" : "Start Audio"}
					</button>
				</span>
			</div>
		</div>
	);
}
