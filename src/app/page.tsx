"use client";

import Header from "./components/header";
import Environment from "./components/environment";

export default function Home() {
	return (
		<div className="font-mono">
			<Header />
			<Environment />
		</div>
	)
}
