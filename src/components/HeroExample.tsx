import { Hero } from "./Hero";

export const HeroExample = () => {
  return (
    <Hero
      pill={{
        text: "Pokaz ROT 29.03 Warszawa",
        href: "/docs",
      }}
      content={{
        title: "Jakub",
        titleHighlight: "Kępka",
        description: "Young Artist from Warsaw Poland, Painter, Fashion Designer",
        primaryAction: {
          href: "/artworks",
          text: "See Artworks",
        },
        secondaryAction: {
          href: "/about",
          text: "About Me",
        },
      }}
      preview={
        <div className="relative w-full h-full min-h-[300px] rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-xs w-full">
            <h3 className="text-lg font-medium mb-2">Preview Content</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">This is a sample preview that you can replace with your own content.</p>
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
              Click me
            </button>
          </div>
        </div>
      }
    />
  );
};

export default HeroExample; 