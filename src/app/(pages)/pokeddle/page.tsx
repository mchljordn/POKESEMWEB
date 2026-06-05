'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PokemonData {
    id: number;
    name: string;
    primaryType: string;
    secondaryType: string | null;
    generation: string;
    height: number;
    weight: number;
    imageUrl: string | null;
    ability: string | null;
    hiddenAbility: string | null;
    evolvesFrom: string | null;
    stats: {
        hp: number;
        attack: number;
        defense: number;
        spAttack: number;
        spDefense: number;
        speed: number;
        total: number;
    };
}

export default function pokeddle() {
    const [pokemon, setPokemon] = useState<PokemonData | null>(null);
    const [guess, setGuess] = useState('');
    const [attempts, setAttempts] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);
    const TOTAL_POKEMON_IN_DB = 1025; // Sesuaikan dengan jumlah total data turtle (.ttl) kamu

    const fetchRandomPokemon = async () => {
        try {
            setLoading(true);
            setIsCorrect(false);
            setAttempts([]);
            setGuess('');

            const randomId = Math.floor(Math.random() * TOTAL_POKEMON_IN_DB) + 1;

            const res = await fetch(`/api/pokemon/${randomId}`);
            const data = await res.json();

            if (data.pokemon) {
                // Jika ontologi kamu terkadang gak punya imageUrl, baru kita kasih fallback ke official artwork
                const finalImageUrl = data.pokemon.imageUrl ||
                    `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(data.pokemon.id).padStart(3, '0')}.png`;

                setPokemon({
                    ...data.pokemon,
                    imageUrl: finalImageUrl
                });
            }
        } catch (err) {
            console.error("Gagal mengambil data via API ID baru:", err);
        } finally {
            setLoading(false);
        }
    };
    const clues = pokemon ? [
        `Generation: ${pokemon.generation}`,
        `Type: ${pokemon.primaryType}${pokemon.secondaryType ? ` / ${pokemon.secondaryType}` : ''}`,
        `Base Stats - HP: ${pokemon.stats.hp} | Atk: ${pokemon.stats.attack} | Def: ${pokemon.stats.defense} | Sp.Atk: ${pokemon.stats.spAttack} | Sp.Def: ${pokemon.stats.spDefense} | Spd: ${pokemon.stats.speed}`,
    ] : [];

    useEffect(() => {
        fetchRandomPokemon();
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && guess.trim() !== '' && pokemon) {
            const currentGuess = guess.trim().toLowerCase();
            const answer = pokemon.name.toLowerCase();

            if (currentGuess === answer) {
                setIsCorrect(true);
            } else {
                // Jika salah, masukkan ke daftar attempts untuk memicu clue berikutnya
                setAttempts([...attempts, guess]);
            }
            setGuess(''); // Kosongkan input setelah tebak
        }
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-[#F9CF01] font-pokemon text-4xl">
                Loading Pokemon...
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-10">
            <div>
                <h1
                    data-text="Guess the PoKéMoN"
                    className="
                    relative font-pokemon text-8xl text-[#F9CF01] tracking-wider
                    before:content-[attr(data-text)] before:absolute before:inset-0
                    before:[-webkit-text-stroke:24px_#4276BD] before:text-[#4276BD]
                    before:z-[-1] drop-shadow-xl"
                >
                    Guess the PoKéMoN
                </h1>
            </div>
            <div className="flex gap-11 text-[#516A9A] font-sf-pro font-medium z-30">
                <Link href="/pokedex" className="hover:underline">pokédex</Link>
                <span>|</span>
                <Link href="/pokeddle" className="hover:underline">pokeddle</Link>
                <span>|</span>
                <Link href="/pokedex-ai" className="hover:underline">pokédex AI</Link>
            </div>
            <div className="relative w-64 h-64 flex items-center justify-center  rounded-2xl p-4 border-4 border-[#516A9A]">
                {pokemon && (
                    <Image
                        src={pokemon.imageUrl}
                        alt="PoKéMoN"
                        width={200}
                        height={200}
                        // Ganti filter brightness secara reaktif berdasarkan state isCorrect
                        className={`object-contain transition-all duration-700 ${isCorrect ? "brightness-100" : "brightness-0"
                            }`}
                        unoptimized
                    />
                )}
            </div>
            <div className="flex flex-col gap-3 items-center justify-center w-full max-w-3xl px-4">

                {/* 1. Iterasi Clues: Langsung tampil semua dari awal game */}
                {clues.map((clueText, index) => {
                    return (
                        <div
                            key={index}
                            className="w-full h-12 pr-5 gap-3 flex items-center rounded-md bg-[#1D1C16] text-[#F9CF01] transition-all duration-300"
                        >
                            <div className="w-12 h-full rounded-md font-pokemon text-3xl flex items-center justify-center bg-[#F9CF01] text-black">
                                {index + 1}
                            </div>
                            <p className="text-lg md:text-xl font-medium">
                                {clueText}
                            </p>
                        </div>
                    );
                })}

                {/* Info status menang */}
                {isCorrect && (
                    <div className="text-center my-2">
                        <p className="text-green-400 font-bold text-2xl animate-bounce">🎉 Correct! It's {pokemon?.name}!</p>
                        <button
                            onClick={fetchRandomPokemon}
                            className="mt-3 bg-[#4276BD] hover:bg-[#355e97] text-white px-6 py-2 rounded-full font-bold cursor-pointer transition-all"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {/* Input tebakan */}
                {!isCorrect && (
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your guess here & Press Enter!"
                        className="w-full h-12 pl-6! pr-5 bg-[#516A9A] text-white placeholder-slate-300 rounded-full outline-none text-lg border-2 border-transparent focus:border-[#F9CF01] transition-all"
                    />
                )}

                {/* Log tebakan yang salah (opsional, tetap dipertahankan biar user tahu apa aja yang udah mereka tebak) */}
                {attempts.length > 0 && !isCorrect && (
                    <p className="text-slate-400 text-sm mt-1">
                        Wrong attempts: <span className="text-red-400">{attempts.join(', ')}</span>
                    </p>
                )}
            </div>
        </div>
    )
}