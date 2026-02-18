"use client";

import Editor from "./components/editor";
import Registers from "./components/registers";
import Memory from "./components/memory";
import useRuntime from "./hooks/useRuntime";

export default function Home() {
	const { running, registers, memory, run, halt, setCode, setRegister, setMemory } = useRuntime();

	return (
		<div className="w-screen h-screen py-20 px-80 flex gap-4">
			<Editor onCodeChange={setCode} />
			<div className="w-full h-full flex flex-1 flex-col">
				<span className="flex justify-end mb-6">
					<button onClick={run} className={`p-2 min-w-[100px] rounded ${running ? "bg-gray-500" : "bg-blue-500"} text-white hover:cursor-pointer`}>Start Audio</button>
					<button onClick={halt} className={`ml-4 p-2 min-w-[100px] rounded ${!running ? "bg-gray-500" : "bg-red-500"} text-white hover:cursor-pointer`}>Stop Audio</button>
				</span>
				<div className="overflow-auto flex flex-col gap-4">
					<Registers registers={registers} onRegisterChange={setRegister} />
					<Memory memory={memory} onMemoryChange={setMemory} />
				</div>
			</div>
		</div>
	);
}
