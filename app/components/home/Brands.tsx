import Image from "next/image";

export default function Brands() {
  const brands = [
    { name: "Versace", src: "/images/versache.png" },
    { name: "Zara", src: "/images/zara.png" },
    { name: "Gucci", src: "/images/gucci.png" },
    { name: "Prada", src: "/images/prada.png" },
    { name: "Calvin Klein", src: "/images/kelvin.png" },
  ];

  return (
    <section className="bg-black py-9 md:py-11 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-8">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="relative h-6 w-24 md:h-9 md:w-36 opacity-90 hover:opacity-100 transition"
          >
            <Image
              src={brand.src}
              alt={brand.name}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}