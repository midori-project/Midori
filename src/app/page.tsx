import Image from "next/image";
import Input from "./home/input";
import Gallery from "./home/gallery";
import PromptBox from "@/components/PromptBox/PromptBoxMi";

export default function Home() {
  return (
    <>
    <div>
    <div className="relative min-h-screen overflow-hidden isolate">
      {/* Background image */}
      <Image
        src="/img/background_home.png"
        alt="background"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-center z-0"
        style={{ objectPosition: 'center' }}
        aria-hidden="true"
      />

      {/* Gradient overlay for tone adjustment (matching Gallery green) */}
      <div
        className="absolute inset-0 z-10 bg-[#68A36940] mix-blend-overlay opacity-80 pointer-events-none"
        aria-hidden="true"
      />

      {/* Frame overlay */}
      <div
        className="absolute inset-0 z-20 bg-[url('/img/frame.png')] bg-cover bg-center opacity-50 mix-blend-multiply pointer-events-none"
        aria-hidden="true"
      />

      {/* Hero Section */}
      <main className="relative z-30 pt-64 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[#0B4421] sm:text-5xl md:text-8xl">
            Grow your site with
            <span className="text-green-600"> Midori</span>
          </h1>
          <p className="mt-6 text-lg text-[#0B4421] max-w-3xl mx-auto">
            Midori is an assistant to create, manage, and grow your website.
          </p>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-30 pt-20 px-4 sm:px-6 lg:px-8">
        <Input />
      </section>
      
    </div>
    </div>
    {/* Gallery Section */}
    <div className="flex flex-col py-16 justify-center items-center bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70 min-h-screen">
      <Gallery />
    </div>
    
</>
  );
}
