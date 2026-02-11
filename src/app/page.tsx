"use client";

import Editor from "./components/editor";
import useRuntime from "./hooks/useRuntime";

export default function Home() {
	const { running, run, halt, setCode } = useRuntime();

	return (
		<div className="w-full h-screen p-100">
			<Editor onCodeChange={setCode} />
			<button onClick={run} className={`m-2 p-2 rounded ${running ? "bg-gray-500" : "bg-blue-500"} text-white hover:cursor-pointer`}>Start Audio</button>
			<button onClick={halt} className={`m-2 p-2 rounded ${!running ? "bg-gray-500" : "bg-red-500"} text-white hover:cursor-pointer`}>Stop Audio</button>
		</div>
	);
}
