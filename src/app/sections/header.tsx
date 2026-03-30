import Link from "next/link";

export default function Header() {
	return (
		<header className="absolute inset-x-0 top-0 z-20 border-b border-ctp-surface0 bg-ctp-base">
			<div className="flex h-12 items-center justify-between px-4 text-ctp-text">
				<h1 className="text-2xl font-bold">Music Machine</h1>
				<nav className="flex gap-4 text-sm text-ctp-subtext0">
					<Link href="/" className="transition-colors hover:text-ctp-text">Home</Link>
					<Link href="/docs" className="transition-colors hover:text-ctp-text">Docs</Link>
				</nav>
			</div>
		</header>
	);
}
