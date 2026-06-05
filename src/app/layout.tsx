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

const sfPro = localFont({
  src: [
    {
      path: "./fonts/SFPRODISPLAYREGULAR.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SFPRODISPLAYLIGHTITALIC.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-sf-pro",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${pokemonFont.variable} ${sfPro.variable}`}>
      <body className="bg-white">
        <main className="pt-8 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}