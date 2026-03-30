"use client";

import Background from "@/app/components/background";
import Header from "@/app/sections/header";
import Environment from "@/app/sections/environment";

export default function Home() {
	return (
		<Background>
			<Header />
			<Environment />
		</Background>
	)
}
