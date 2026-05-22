import { Funnel, Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-10">
            <h1
                data-text="PoKéDexiA"
                className="
          relative font-pokemon text-8xl text-[#F9CF01] tracking-wider
          before:content-[attr(data-text)] before:absolute before:inset-0
          before:[-webkit-text-stroke:24px_#4276BD] before:text-[#4276BD]
          before:z-[-1] drop-shadow-xl
        "
            >
                PoKéDexiA
            </h1>
            <div className="flex gap-3 items-center justify-center w-full max-w-3xl px-4">
                <div className="relative flex-1 flex items-center">
                    <input
                        type="text"
                        placeholder="Search by Name or ID..."
                        // pl-12: sengaja dikasih space agak besar di kiri biar teks ketikan gak menabrak ikon Search
                        className="w-full h-12 pl-6! pr-5 bg-[#516A9A] text-[#F9CF01] placeholder-[#F9CF01]/60 rounded-full outline-none"
                    />

                    {/* 2. Ikon Search dikunci posisinya di sebelah kiri dalam input (Absolute Positioning) */}
                    <div className="absolute right-4 text-[#F9CF01] pointer-events-none flex items-center justify-center">
                        <Search />
                    </div>
                </div>

                <button
                    // Menghapus px-20, menggantinya dengan w-24 biar lebarnya proporsional
                    className="bg-[#516A9A] hover:bg-[#425780] transition-colors text-[#F9CF01] w-12 h-12 font-bold rounded-full cursor-pointer flex items-center justify-center"
                >

                    <Funnel />
                </button>
            </div>
            <div className="flex gap-11 text-[#516A9A]">
                <Link href="/pokedex">pokédex</Link>
                <span>|</span>
                <Link href="/statistics">statistic</Link>
                <span>|</span>
                <Link href="/pokeddle">pokeddle</Link>
            </div>
        </div>
    )
}