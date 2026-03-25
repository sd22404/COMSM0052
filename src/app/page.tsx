"use client";

import Header from "./components/header";
import Environment from "./components/environment";

export default function Home() {
	return (
		<div className="flex flex-col w-screen h-screen font-mono">
			<Header />
			<Environment className="py-20 px-20 flex flex-1 gap-8"/>
		</div>
	)
}
