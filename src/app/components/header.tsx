import Link from "next/link";

export default function Header() {
	return (
		<div className="absolute font-mono w-full min-h-16 bg-gray-800 text-white flex items-center px-4">
			<h1 className="text-lg font-bold">Music Machine</h1>
			<nav className="text-md ml-auto flex gap-8">
				<Link href="/" className="hover:underline">Home</Link>
				<Link href="/docs" className="hover:underline">Docs</Link>
			</nav>
		</div>
	)
}