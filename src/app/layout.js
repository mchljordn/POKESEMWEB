import './globals.css';

export const metadata = {
  title: 'Dinopedia - Pokemon Semantic Web API',
  description: 'Pokemon semantic web backend with SPARQL queries to Apache Jena Fuseki',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
