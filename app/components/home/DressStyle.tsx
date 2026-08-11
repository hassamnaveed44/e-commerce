import Link from "next/link";
import Image from "next/image";

interface DressStyle {
  id: string;
  name: string;
  image: string;
  className: string;
}

const dressStyles: DressStyle[] = [
  {
    id: "casual",
    name: "Casual",
    image: "/images/casual.png",
    className: "col-span-1 md:col-span-1",
  },
  {
    id: "formal",
    name: "Formal",
    image: "/images/formal.png",
    className: "col-span-1 md:col-span-2",
  },
  {
    id: "party",
    name: "Party",
    image: "/images/partydress.png",
    className: "col-span-1 md:col-span-2",
  },
  {
    id: "gym",
    name: "Gym",
    image: "/images/gymfit.png",
    className: "col-span-1 md:col-span-1",
  },
];

export default function DressStyleSection() {
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10">
        <div className="bg-[#F0F0F0] rounded-[40px] py-10 px-6 sm:px-12 md:px-16 w-full">
          
          {/* Section Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center uppercase tracking-tight mb-8 md:mb-14 font-integral text-black">
            BROWSE BY DRESS STYLE
          </h2>

          {/* Styles Grid - Links to /category/[style.id] */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {dressStyles.map((style) => (
              <Link
                key={style.id}
                href={`/category/${style.id}`}
                className={`relative rounded-[20px] overflow-hidden bg-white h-[180px] sm:h-[289px] group transition duration-300 ${style.className}`}
              >
                {/* Style Label */}
                <span className="absolute top-6 left-6 sm:top-8 sm:left-8 text-2xl sm:text-3xl font-bold font-satoshi text-black z-10">
                  {style.name}
                </span>

                {/* Style Image */}
                <Image
                  src={style.image}
                  alt={style.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition duration-500"
                />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
