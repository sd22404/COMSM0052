import Editor from "./editor";
import Registers from "./registers";
import Memory from "./memory";
import Help from "./help";
import useRuntime from "../hooks/useRuntime";
import Cores from "./cores";

export default function Environment() {
	const { runtime: { running, memory, cores }, run, halt, setCode, setMemory, toggleCore } = useRuntime();

	return (
		<div className="w-screen h-screen pt-26 pb-10 px-10 flex gap-8">
			<div className="w-full h-full flex-1">
				<Editor onCodeChange={setCode} />
			</div>
			<div className="w-full h-full flex flex-1 flex-col gap-8">
				<div className="overflow-hidden flex flex-col gap-8 items-end">
					<Cores cores={cores} toggleCore={toggleCore} />
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
