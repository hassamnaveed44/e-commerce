export default function NewsletterBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 relative z-25 -mb-20 flex justify-center">
      <div 
        className="bg-black rounded-[20px] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md w-full max-w-[1240px]"
        style={{
          width: "1240px",
          minHeight: "180px",
          paddingTop: "36px",
          paddingBottom: "36px",
          paddingLeft: "64px",
          paddingRight: "64px",
          opacity: 1,
        }}
      >
        <h2 
          className="text-white uppercase tracking-tight font-integral text-center lg:text-left"
          style={{
            width: "551px",
            minHeight: "94px",
            fontWeight: 700,
            fontSize: "40px",
            lineHeight: "45px",
            letterSpacing: "0%",
            opacity: 1,
          }}
        >
          STAY UPTO DATE ABOUT OUR LATEST OFFERS
        </h2>

        <div 
          className="flex flex-col w-full lg:w-[349px]"
          style={{
            width: "349px",
            minHeight: "108px",
            gap: "14px",
            opacity: 1,
          }}
        >
          <div 
            className="relative w-full bg-white flex items-center"
            style={{
              width: "349px",
              height: "48px",
              borderRadius: "62px",
              paddingTop: "12px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              paddingRight: "16px",
              gap: "12px",
              opacity: 1,
            }}
          >
            <span className="text-black/40 text-sm pointer-events-none flex items-center">
              ✉
            </span>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full bg-transparent text-black text-sm focus:outline-none font-satoshi"
            />
          </div>
          <button 
            className="w-full bg-white text-black font-medium text-sm hover:bg-white/90 transition shadow-sm font-satoshi flex items-center justify-center"
            style={{
              width: "349px",
              height: "48px",
              borderRadius: "62px",
              paddingTop: "12px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              paddingRight: "16px",
              gap: "12px",
              opacity: 1,
            }}
          >
            Subscribe to Newsletter
          </button>
        </div>
      </div>
    </div>
  );
}