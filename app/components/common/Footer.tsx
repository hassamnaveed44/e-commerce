"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import { FaFacebookF, FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";

const linkColumns = [
  {
    heading: "COMPANY",
    links: ["About", "Features", "Works", "Career"],
  },
  {
    heading: "HELP",
    links: ["Customer Support", "Delivery Details", "Terms & Conditions", "Privacy Policy"],
  },
  {
    heading: "FAQ",
    links: ["Account", "Manage Deliveries", "Orders", "Payments"],
  },
  {
    heading: "RESOURCES",
    links: ["Free eBooks", "Development Tutorial", "How to - Blog", "Youtube Playlist"],
  },
];

const socials = [
  { icon: FaXTwitter, href: "#", label: "Twitter", filled: false },
  { icon: FaFacebookF, href: "#", label: "Facebook", filled: true },
  { icon: FaInstagram, href: "#", label: "Instagram", filled: false },
  { icon: FaGithub, href: "#", label: "Github", filled: false },
];

const paymentIcons = [
  { label: "Visa", src: "/images/visa.png" },
  { label: "Mastercard", src: "/images/mastercard.png" },
  { label: "PayPal", src: "/images/paypal.png" },
  { label: "Apple Pay", src: "/images/epay.png" },
  { label: "G Pay", src: "/images/gpay.png" },
];

export default function Footer() {
  return (
    <footer className="bg-white font-satoshi overflow-visible">
      {/* Newsletter card */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 xl:px-0 relative z-10">
        <div
          className="
            bg-black rounded-[20px]
            flex flex-col md:flex-row md:items-center md:justify-between
            gap-8 md:gap-6
            px-6 py-8 sm:px-10 sm:py-10
            md:px-16 md:py-9 md:h-[180px] md:mb-[-90px]
          "
        >
          <h2
            className="
              font-integral font-bold uppercase text-white
              text-[26px] leading-[1.15] sm:text-[32px]
              md:text-[40px] md:leading-[45px]
              md:w-[551px] md:h-[94px] md:flex md:items-center
            "
          >
            Stay upto date about our latest offers
          </h2>

          <div
            className="
              flex flex-col gap-3 md:gap-[14px]
              w-full md:w-[349px] md:h-[108px] md:justify-center
              shrink-0
            "
          >
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full h-12 md:h-[48px] rounded-[62px] bg-white pl-12 pr-5 text-sm text-black placeholder:text-black/40 outline-none"
              />
            </div>
            <button className="w-full h-[46px] rounded-[62px] bg-white text-black text-sm sm:text-base font-medium px-4 py-3 hover:bg-white/90 transition">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>

      {/* Grey band */}
      <div className="bg-[#F0F0F0] pt-16 sm:pt-20 md:pt-[154px] pb-8">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 xl:px-0">
          {/* Logo + tagline + socials + link columns */}
          <div className="flex flex-col md:flex-row md:justify-between gap-10 md:gap-8">
            {/* Logo block */}
            <div className="max-w-[248px]">
              <Image
                src="/images/shopcologo.png"
                alt="Shop.co"
                width={150}
                height={32}
                className="h-7 sm:h-8 w-auto mb-5 sm:mb-6"
              />
              <p className="text-black/60 text-sm leading-5 mb-6">
                We have clothes that suits your style and which you&apos;re proud to
                wear. From women to men.
              </p>
              <div className="flex items-center gap-3">
                {socials.map(({ icon: Icon, href, label, filled }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                      filled
                        ? "bg-black border-black text-white"
                        : "bg-white border-black/20 text-black hover:bg-black hover:text-white hover:border-black"
                    }`}
                  >
                    <Icon size={12} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-10 sm:justify-between sm:flex-1 md:w-[calc(100%-248px-32px)]">
              {linkColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="text-xs  font-medium tracking-[0.1em] uppercase text-black mb-5 sm:mb-6">
                    {col.heading}
                  </h4>
                  <ul className="flex flex-col gap-4">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-black/60 text-[15px] sm:text-base leading-[19px] hover:text-black transition"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/10 mt-10 sm:mt-12 md:mt-14 pt-6" />

          {/* Bottom bar */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <p className="text-black/60 text-sm text-center sm:text-left">
              Shop.co © 2000-2023, All Rights Reserved
            </p>
            <div className="flex items-center gap-3 sm:gap-[12px]">
              {paymentIcons.map((p) => (
                <div
                  key={p.label}
                  aria-label={p.label}
                  style={{
                    width: "46.61px",
                    height: "30.03px",
                    borderRadius: "5.38px",
                    borderWidth: "0.22px",
                    boxShadow: "0px 0.45px 4.48px 0px rgba(183, 183, 183, 0.08), 0px 4.48px 8.96px 0px rgba(183, 183, 183, 0.08)",
                  }}
                  className="bg-white border-[#D6DCE5] flex items-center justify-center overflow-hidden shrink-0"
                >
                  <Image
                    src={p.src}
                    alt={p.label}
                    width={36}
                    height={22}
                    className="max-h-[16px] w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}