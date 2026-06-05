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
interface EvolutionMember {
    id: number;
    name: string;
    primaryType: string;
    secondaryType: string | null;
    stage: number; // 1, 2, atau 3
    imageUrl: string | null
}

interface PokemonDetail extends PokemonData {
    evolutionChain: EvolutionMember[];
}

'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function TypeIcon({ type }: { type: string }) {
    const typeLower = type.toLowerCase();

    return (
        <div title={type} className="h-6 flex items-center select-none">
            <img
                src={`/pokemon-type/${typeLower}.png`} // Mengarah ke folder public/pokemon-type/
                alt={type}
                className="h-full w-auto object-contain" // Kunci tinggi (h-full), lebar otomatis (w-auto)
                onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/24?text=?";
                }}
            />
        </div>
    );
}



export default function PokemonPage({ params }: { params: { id: string } }) {
    const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getDetail() {
            try {
                setLoading(true);
                const res = await fetch(`/api/pokemon/${params.id}`);
                const data = await res.json();
                console.log("=== DEBUG DATA DARI API ===", data);
                if (data.pokemon) {
                    // Gunakan data evolutionChain asli dari API. 
                    // Jika kosong (misal pokemon tidak berevolusi), default-kan ke dirinya sendiri.
                    const realEvolution: EvolutionMember[] = data.pokemon.evolutionChain || [
                        {
                            id: data.pokemon.id,
                            name: data.pokemon.name,
                            primaryType: data.pokemon.primaryType,
                            secondaryType: data.pokemon.secondaryType,
                            stage: data.pokemon.evolvesFrom ? 2 : 1
                        }
                    ];

                    setPokemon({
                        ...data.pokemon,
                        imageUrl: data.pokemon.imageUrl || `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(data.pokemon.id).padStart(4, '0')}.png`,
                        evolutionChain: realEvolution
                    });
                }
            } catch (err) {
                console.error("Gagal load detail pokemon:", err);
            } finally {
                setLoading(false);
            }
        }
        getDetail();
    }, [params.id]);

    if (loading) return <div className="flex h-screen items-center justify-center text-[#F9CF01] font-pokemon text-3xl animate-pulse">Loading PokéDex...</div>;
    if (!pokemon) return <div className="flex h-screen items-center justify-center text-white">Pokémon Not Found.</div>;

    // 💡 LOGIKA DETEKSI MULTI-EVOLUSI (Kayak Eevee)
    const stage2Count = pokemon.evolutionChain.filter(p => p.stage === 2).length;
    const stage3Count = pokemon.evolutionChain.filter(p => p.stage === 3).length;
    const isMultiEvolution = stage2Count > 1 || stage3Count > 1;

    // Kelompokkan evolusi berdasarkan stage untuk mempermudah render layout kanan (grid)
    const evoStage1 = pokemon.evolutionChain.filter(p => p.stage === 1);
    const evoStage2 = pokemon.evolutionChain.filter(p => p.stage === 2);
    const evoStage3 = pokemon.evolutionChain.filter(p => p.stage === 3);

    // Helper untuk render card kecil di section evolusi
    const renderEvoCard = (member: EvolutionMember) => {
        const paddedId = String(member.id).padStart(4, '0');

        // Gunakan imageUrl langsung dari database SemWeb. 
        // Jika kolom di .ttl ternyata kosong, baru lempar ke fallback official artwork 3-digit
        const finalImgUrl = member.imageUrl ||
            `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${member.id < 1000 ? String(member.id).padStart(3, '0') : member.id}.png`;

        return (
            <Link
                href={`/pokemon/${member.id}`}
                key={member.id}
                className="flex flex-col items-center w-full p-3 hover:bg-[#516A9A]/10 rounded-xl transition-all border border-transparent hover:border-[#4276BD]/30"
            >
                {/* Pakai tag img standar agar kebal dari restriksi caching Next.js Image Component */}
                <div className="w-24 h-24 flex items-center justify-center">
                    <img
                        src={finalImgUrl}
                        alt={member.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                            // Backup jika link database & assets utama dua-duanya crash/404
                            e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.id}.png`;
                        }}
                    />
                </div>

                <span className="font-bold text-sm text-slate-200 mt-3 capitalize text-center truncate w-full">
                    {member.name}
                </span>
                <span className="text-xs text-slate-500">#{paddedId}</span>

                {/* Render Ikon Tipe secara dinamis di dalam card kecil */}
                <div className="flex gap-1 mt-2 transform scale-90 justify-center">
                    <TypeIcon type={member.primaryType} />
                    {member.secondaryType && <TypeIcon type={member.secondaryType} />}
                </div>
            </Link>
        );
    };

    return (
        <div className="flex flex-col items-center min-h-screen  py-10 px-4 font-sans">
            {/* Header Logo */}
            <div className="flex flex-col items-center mb-6">
                <h1 data-text="PokéDex" className="relative font-pokemon text-5xl text-[#F9CF01] tracking-wider before:content-[attr(data-text)] before:absolute before:inset-0 before:[-webkit-text-stroke:12px_#4276BD] before:text-[#4276BD] before:z-[-1] drop-shadow-md">
                    PokéDex
                </h1>
                <div className="flex gap-11 text-[#516A9A] font-sf-pro font-medium z-30">
                    <Link href="/pokedex" className="hover:underline">pokédex</Link>
                    <span>|</span>
                    <Link href="/pokeddle" className="hover:underline">pokeddle</Link>
                    <span>|</span>
                    <Link href="/pokedex-ai" className="hover:underline">pokédex AI</Link>
                </div>
            </div>

            {/* Main Pokémon Image */}
            <div className="relative w-72 h-72 my-4">
                <Image src={pokemon.imageUrl!} alt={pokemon.name} fill className="object-contain" unoptimized />
            </div>

            {/* Info Grid (ID, Name, Type, Weight, Height, Generation) */}
            <div className="grid grid-cols-3 gap-6 text-center w-full max-w-md my-6  p-4 rounded-2xl å">
                <div><p className="text-xs  font-medium">ID</p><p className="font-bold ">#{String(pokemon.id).padStart(4, '0')}</p></div>
                <div><p className="text-xs text-slate-400 font-medium">Name</p><p className="font-bold capitalize">{pokemon.name}</p></div>
                <div>
                    <p className="text-xs  font-medium">Type</p>
                    <div className="flex justify-center gap-1 mt-0.5">
                        <div className="flex gap-1.5">
                            <TypeIcon type={pokemon.primaryType} />
                            {pokemon.secondaryType && <TypeIcon type={pokemon.secondaryType} />}
                        </div>
                    </div>
                </div>
                <div><p className="text-xs  font-medium">Weight</p><p className="font-bold ">{pokemon.weight}kg</p></div>
                <div><p className="text-xs  font-medium">Height</p><p className="font-bold ">{pokemon.height}m</p></div>
                <div><p className="text-xs  font-medium">Generation</p><p className="font-bold ">{pokemon.generation}</p></div>
            </div>

            {/* Abilities Section */}
            <div className="text-center my-4">
                <p className="text-xs font-semibold uppercase tracking-wider">Abilities</p>
                <p className="text-xl font-bold  mt-1">{pokemon.ability || 'None'}</p>
                {pokemon.hiddenAbility && <p className="text-sm font-semibold  mt-0.5">Hidden: {pokemon.hiddenAbility}</p>}
            </div>

            {/* Base Stats Progress Bars */}
            <div className="w-full max-w-md space-y-3p-5 my-4">
                {Object.entries(pokemon.stats).map(([statName, statValue]) => {
                    if (statName === 'total') return null;
                    const maxStatValue = 255; // Stat tertinggi absolut di Pokemon game
                    const percentage = (statValue / maxStatValue) * 100;
                    return (
                        <div key={statName} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold uppercase tracking-wide ">
                                <span>{statName === 'spAttack' ? 'Sp. Attack' : statName === 'spDefense' ? 'Sp. Defense' : statName}</span>
                                <span className="">{statValue}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div className="h-full bg-gradient-to-r from-[#4276BD] to-[#516A9A] rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                            </div>
                        </div>
                    );
                })}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-sm font-bold  uppercase">Total</span>
                    <span className="text-2xl font-black text-[#F9CF01] font-pokemon tracking-wide">{pokemon.stats.total}</span>
                </div>
            </div>

            {/* ==================== EVOLUTION SECTION ==================== */}
            <div className="w-full max-w-3xl mt-12 pt-8 border-t border-slate-800/60">
                <h3 className="text-center font-bold text-lg text-slate-400 mb-8 uppercase tracking-widest">
                    Evolution
                </h3>

                {/* KONDISI 1: JIKA POKEMON MULTI-BRANCH (SEPERTI EEVEE / MOCKUP KANAN) */}
                {isMultiEvolution ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full bg-slate-900/10 p-6 rounded-2xl border border-slate-900">
                        {/* Kolom Stage 1 */}
                        <div className="flex flex-col items-center min-w-[130px] bg-slate-900/20 p-2 rounded-xl border border-slate-800/40">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Stage 1</span>
                            {evoStage1.map(renderEvoCard)}
                        </div>

                        {/* Panah Indikator yang adaptif mendeteksi layar HP vs PC */}
                        <div className="text-[#4276BD] text-2xl font-bold transform rotate-90 md:rotate-0 animate-pulse">
                            ➔
                        </div>

                        {/* Kolom Stage 2 Berbentuk Grid Banyak Cabang (Eevee Mode) */}
                        <div className="flex-1 w-full">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3 block text-center md:text-left">
                                Stage 2 Branches
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/40">
                                {evoStage2.map(renderEvoCard)}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* KONDISI 2: JIKA LINEAR NORMAL (SEPERTI BULBASAUR / MOCKUP KIRI) */
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 max-w-2xl mx-auto bg-slate-900/10 p-6 rounded-2xl border border-slate-900">
                        {pokemon.evolutionChain.sort((a, b) => a.stage - b.stage).map((member, index, arr) => (
                            <div key={member.id} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                                {/* Card Anggota Silsilah */}
                                <div className="relative flex flex-col items-center bg-slate-900/20 p-2 rounded-xl border border-slate-800/40 min-w-[140px]">
                                    {renderEvoCard(member)}
                                    <span className="text-[9px] font-black text-[#516A9A] uppercase tracking-wider mt-1 bg-[#516A9A]/10 px-2 py-0.5 rounded-full">
                                        Stage {member.stage}
                                    </span>
                                </div>

                                {/* Menggambar panah penyambung antar tahapan */}
                                {index < arr.length - 1 && (
                                    <div className="text-[#4276BD] text-2xl font-bold transform rotate-90 sm:rotate-0 my-1 sm:my-0 animate-pulse">
                                        ➔
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Navigation Controls */}
            <div className="flex justify-between items-center w-full max-w-md mt-12 px-4">
                <Link href={`/pokemon/${Math.max(1, pokemon.id - 1)}`} className="text-2xl text-[#4276BD] hover:text-[#F9CF01] font-bold transition-colors">←</Link>
                <div className="w-full mx-6 h-10 bg-[#516A9A]/30 rounded-full flex items-center px-4 border border-slate-800">
                    <input type="text" placeholder="Search by Name or ID..." className="bg-transparent w-full outline-none text-sm text-white placeholder-slate-500" />
                </div>
                <Link href={`/pokemon/${pokemon.id + 1}`} className="text-2xl text-[#4276BD] hover:text-[#F9CF01] font-bold transition-colors">→</Link>
            </div>
        </div>
    );
}