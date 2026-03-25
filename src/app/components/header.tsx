import Link from "next/link";

export default function Header() {
	return (
		<div className="absolute w-full min-h-16 bg-gray-800 text-white flex items-center px-4">
			<h1 className="text-2xl font-bold">Music Machine</h1>
			<nav className="ml-auto flex gap-4">
				<Link href="/" className="hover:underline">Home</Link>
				<Link href="/docs" className="hover:underline">Docs</Link>
			</nav>
		</div>
	)
}
