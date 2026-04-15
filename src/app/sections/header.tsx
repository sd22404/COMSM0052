import Link from "next/link";
import { Heading } from "../components/text";

export default function Header() {
	return (
		<header className="absolute inset-x-0 top-0 z-100 border-b border-ctp-surface0 bg-ctp-mantle">
			<div className="flex h-12 items-center justify-between px-4 text-ctp-text">
				<Heading tone="mauve">Music Machine</Heading>
				<nav className="flex items-center gap-4 text-sm text-ctp-subtext0">
					<Link href="/" className="transition-colors hover:text-ctp-lavender">
						App
					</Link>
					<Link href="/tutorial" className="transition-colors hover:text-ctp-lavender">
						Tutorial
					</Link>
				</nav>
			</div>
		</header>
	);
}
