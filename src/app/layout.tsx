import "./globals.css";
import localFont from "next/font/local";

export const metadata = {
  title: 'Dinopedia - Pokemon Semantic Web API',
  description: 'Pokemon semantic web backend with SPARQL queries to Apache Jena Fuseki',
};

const pokemonFont = localFont({
  src: "./fonts/PokemonSolid.ttf",
  variable: "--font-pokemon",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pokemonFont.variable}>
      <body>{children}</body>
    </html>
  );
}
