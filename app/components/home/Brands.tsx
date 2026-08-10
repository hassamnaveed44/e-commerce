export default function Brands() {
  const brands = [
    { name: "VERSACE", className: "font-serif tracking-widest text-2xl md:text-4xl" },
    { name: "ZARA", className: "font-sans font-bold tracking-tighter text-2xl md:text-4xl" },
    { name: "GUCCI", className: "font-serif tracking-widest text-2xl md:text-4xl" },
    { name: "PRADA", className: "font-serif tracking-widest text-2xl md:text-4xl" },
    { name: "Calvin Klein", className: "font-sans tracking-normal text-2xl md:text-4xl" },
  ];

  return (
    <section className="bg-black py-9 md:py-11 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-8">
        {brands.map((brand, index) => (
          <span
            key={index}
            className={`${brand.className} text-white uppercase opacity-90 hover:opacity-100 transition`}
          >
            {brand.name}
          </span>
        ))}
      </div>
    </section>
  );
}