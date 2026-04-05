import Link from "next/link";
import { Heading } from "../components/text";

export default function Header() {
	return (
		<header className="absolute inset-x-0 top-0 z-20 border-b border-ctp-surface0 bg-ctp-mantle">
			<div className="flex h-12 items-center justify-between px-4 text-ctp-text">
				<Heading>Music Machine</Heading>
				<nav className="flex gap-4 text-ctp-subtext0">
					<Link href="/" className="transition-colors hover:text-ctp-lavender">Home</Link>
					<Link href="/docs" className="transition-colors hover:text-ctp-lavender">Docs</Link>
				</nav>
			</div>
		</header>
	);
}
