"use client";

import Background from "@/app/components/background";
import Header from "@/app/sections/header";
import Workspace from "@/app/sections/workspace";

export default function Home() {
	return (
		<Background>
			<Header />
			<Workspace />
		</Background>
	)
}
