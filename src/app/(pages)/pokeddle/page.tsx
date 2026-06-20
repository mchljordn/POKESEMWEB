'use client';
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
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
    const [hasGivenUp, setHasGivenUp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [revealedCount, setRevealedCount] = useState(0);
    
    // States for autocomplete
    const [allPokemonNames, setAllPokemonNames] = useState<{name: string, id: number}[]>([]);
    const [suggestions, setSuggestions] = useState<{name: string, id: number}[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    
    const TOTAL_POKEMON_IN_DB = 1025; // Sesuaikan dengan jumlah total data turtle (.ttl) kamu

    const fetchRandomPokemon = async () => {
        try {
            setLoading(true);
            setIsCorrect(false);
            setHasGivenUp(false);
            setAttempts([]);
            setGuess('');
            setRevealedCount(0);

            const randomId = Math.floor(Math.random() * TOTAL_POKEMON_IN_DB) + 1;

            const res = await fetch(`/api/pokemon/${randomId}`);
            const data = await res.json();

            if (data.pokemon) {
                // Jika ontologi kamu terkadang gak punya imageUrl, baru kita kasih fallback ke official artwork
                const finalImageUrl = data.pokemon.imageUrl ||
                    `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(data.pokemon.id).padStart(3, '0')}.png`;

                // Obfuscate URL using base64 to hide the ID from inspect element
                const encodedUrl = btoa(finalImageUrl);
                const proxyUrl = `/api/image-proxy?q=${encodedUrl}`;

                setPokemon({
                    ...data.pokemon,
                    imageUrl: proxyUrl
                });
            }
        } catch (err) {
            console.error("Gagal mengambil data via API ID baru:", err);
        } finally {
            setLoading(false);
        }
    };
    const getRegion = (gen: string | number) => {
        switch (String(gen)) {
            case '1': return 'Kanto';
            case '2': return 'Johto';
            case '3': return 'Hoenn';
            case '4': return 'Sinnoh';
            case '5': return 'Unova';
            case '6': return 'Kalos';
            case '7': return 'Alola';
            case '8': return 'Galar';
            case '9': return 'Paldea';
            default: return 'Unknown';
        }
    };

    const clues = pokemon ? [
        `Region: ${getRegion(pokemon.generation)}`,
        `Type: ${pokemon.primaryType}${pokemon.secondaryType ? ` / ${pokemon.secondaryType}` : ''}`,
        `Weight: ${pokemon.weight}kg | Height: ${pokemon.height}m`,
        `Abilities: ${pokemon.ability}${pokemon.hiddenAbility ? `, ${pokemon.hiddenAbility} (Hidden)` : ''}`,
        `ID: #${String(pokemon.id).padStart(4, '0')}`,
    ] : [];

    useEffect(() => {
        fetchRandomPokemon();
        
        // Fetch all names for autocomplete
        const fetchNames = async () => {
            try {
                const res = await fetch("/api/pokemon?limit=1025");
                const data = await res.json();
                if (data.pokemon) {
                    setAllPokemonNames(data.pokemon.map((p: any) => ({ name: p.name, id: p.id })));
                }
            } catch (err) {
                console.error("Failed to fetch Pokemon names:", err);
            }
        };
        fetchNames();
    }, []);

    const submitGuess = (currentGuess: string) => {
        if (!pokemon || currentGuess.trim() === '') return;
        
        const answer = pokemon.name.toLowerCase();
        const normalizedGuess = currentGuess.trim().toLowerCase();

        if (normalizedGuess === answer) {
            setIsCorrect(true);
        } else {
            // Jika salah, masukkan ke daftar attempts untuk memicu clue berikutnya
            setAttempts(prev => [...prev, currentGuess.trim()]);
        }
        setGuess(''); // Kosongkan input setelah tebak
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                submitGuess(suggestions[activeSuggestionIndex].name);
            } else {
                submitGuess(guess);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault(); // Mencegah cursor pindah posisi
            if (showSuggestions && suggestions.length > 0) {
                setActiveSuggestionIndex((prevIndex) => 
                    prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
                );
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                setActiveSuggestionIndex((prevIndex) => 
                    prevIndex > 0 ? prevIndex - 1 : -1
                );
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGuess(value);
        if (value.trim().length > 0) {
            const filtered = allPokemonNames
                .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 5); // limit to 5 suggestions
            setSuggestions(filtered);
            setShowSuggestions(true);
            setActiveSuggestionIndex(-1); // Reset highlight pas user ngetik ulang
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
        }
    };

    const handleSuggestionClick = (name: string) => {
        submitGuess(name);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-[#F9CF01] font-pokemon text-4xl">
                Loading Pokemon...
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-start min-h-screen pt-12 pb-20 bg-white text-[#516A9A] font-sf-pro gap-6">
            
            {/* 1. HEADER LOGO */}
            <Logo text="PokéDdle" className="w-[85vw] sm:w-[60vw] md:w-[45vw] max-w-3xl mt-4 mb-4" />
            <div className="flex flex-wrap justify-center gap-4 sm:gap-11 text-[#516A9A] font-sf-pro text-sm sm:text-base font-semibold px-4 z-40 mb-6">
              <Link href="/pokedex" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex</Link>
              <span className="hidden sm:inline">|</span>
              <Link href="/pokeddle" className="hover:underline hover:text-[#4276BD] transition-colors">pokeddle</Link>
              <span className="hidden sm:inline">|</span>
              <Link href="/pokedex-ai" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex AI</Link>
            </div>
            <div className="relative w-64 h-64 flex items-center justify-center  rounded-2xl p-4 border-4 border-[#516A9A]">
                {pokemon && (
                    <Image
                        src={pokemon.imageUrl}
                        alt="PoKéMoN"
                        width={200}
                        height={200}
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        // Ganti filter brightness secara reaktif berdasarkan state isCorrect atau hasGivenUp
                        className={`pointer-events-none select-none object-contain transition-all duration-700 ${isCorrect || hasGivenUp ? "brightness-100" : "brightness-0"
                            }`}
                        unoptimized
                    />
                )}
            </div>
            <div className="flex flex-col gap-3 items-center justify-center w-full max-w-3xl px-4">

                {/* 1. Iterasi Clues: Bisa diklik untuk dibuka satu per satu secara progresif */}
                {clues.map((clueText, index) => {
                    const isRevealed = index < revealedCount || isCorrect || hasGivenUp;
                    const isNextToReveal = index === revealedCount && !isCorrect && !hasGivenUp;

                    return (
                        <div
                            key={index}
                            onClick={() => {
                                if (isNextToReveal) {
                                    setRevealedCount(revealedCount + 1);
                                }
                            }}
                            className={`w-full h-12 pr-5 gap-3 flex items-center rounded-md transition-all duration-300 ${
                                isRevealed 
                                ? "bg-[#1D1C16] text-[#F9CF01]" 
                                : isNextToReveal
                                    ? "bg-[#516A9A] cursor-pointer hover:bg-[#4276BD] text-transparent shadow-[0_0_15px_rgba(81,106,154,0.3)]"
                                    : "bg-[#2A3752] text-transparent cursor-not-allowed opacity-60"
                            }`}
                        >
                            <div className={`w-12 h-full rounded-md font-pokemon text-3xl flex items-center justify-center transition-colors ${
                                isRevealed ? "bg-[#F9CF01] text-black" : "bg-[#1D1C16] text-[#516A9A]"
                            }`}>
                                {index + 1}
                            </div>
                            <div className="flex-1 relative">
                                {isRevealed ? (
                                    <p className="text-sm sm:text-base md:text-xl font-medium">
                                        {clueText}
                                    </p>
                                ) : isNextToReveal ? (
                                    <p className="text-sm sm:text-base md:text-xl font-bold text-white text-center w-full select-none animate-pulse">
                                        Click to reveal Hint #{index + 1}
                                    </p>
                                ) : (
                                    <p className="text-lg md:text-xl font-bold text-slate-400/50 text-center w-full select-none">
                                        Locked
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Info status menang */}
                {isCorrect && (
                    <div className="text-center my-2">
                        <p className="text-green-400 font-bold text-2xl animate-bounce">Correct! It's {pokemon?.name}!</p>
                        <button
                            onClick={fetchRandomPokemon}
                            className="mt-3 bg-[#4276BD] hover:bg-[#355e97] text-white px-6 py-2 rounded-full font-bold cursor-pointer transition-all"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {/* Info status menyerah */}
                {hasGivenUp && (
                    <div className="text-center my-2">
                        <p className="text-red-400 font-bold text-2xl">Aww... It was {pokemon?.name}!</p>
                        <button
                            onClick={fetchRandomPokemon}
                            className="mt-3 bg-[#4276BD] hover:bg-[#355e97] text-white px-6 py-2 rounded-full font-bold cursor-pointer transition-all"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {/* Input tebakan & Suggestions Container */}
                <div className="relative w-full flex gap-3">
                    {!isCorrect && !hasGivenUp && (
                        <>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={guess}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyPress}
                                    onFocus={() => { if (guess.trim().length > 0) setShowSuggestions(true); }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Type your guess here & Press Enter!"
                                    className="w-full h-12 pl-6 pr-5 bg-[#516A9A] text-[#F9CF01] placeholder-[#F9CF01]/60 rounded-full outline-none text-lg font-sf-pro italic shadow-md focus:ring-2 focus:ring-[#F9CF01] transition-all"
                                />

                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-14 left-0 w-full bg-[#516A9A]/95 backdrop-blur-md border border-[#4276BD] rounded-2xl overflow-hidden z-50 flex flex-col shadow-xl py-1">
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                onMouseEnter={() => setActiveSuggestionIndex(idx)}
                                                onClick={() => handleSuggestionClick(s.name)}
                                                className={`px-6 py-2.5 cursor-pointer text-white font-sf-pro font-semibold capitalize transition-colors flex items-center gap-2 ${
                                                    idx === activeSuggestionIndex ? 'bg-[#4276BD]' : 'hover:bg-[#4276BD]'
                                                }`}
                                            >
                                                <span>{s.name}</span>
                                                <span className="italic text-[#F9CF01] text-xs">#{String(s.id).padStart(4, '0')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Tombol Reveal */}
                            <button
                                onClick={() => setHasGivenUp(true)}
                                className="bg-[#516A9A] hover:bg-[#3e5889] text-white px-6 py-2 rounded-full font-bold cursor-pointer transition-all shrink-0"
                            >
                                Reveal
                            </button>
                        </>
                    )}
                </div>

                {/* Log tebakan yang salah (opsional, tetap dipertahankan biar user tahu apa aja yang udah mereka tebak) */}
                {attempts.length > 0 && !isCorrect && !hasGivenUp && (
                    <p className="text-slate-400 text-sm mt-1">
                        Wrong attempts: <span className="text-red-400">{attempts.join(', ')}</span>
                    </p>
                )}
            </div>

        </div>
    )
}