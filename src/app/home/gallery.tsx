import { CardCommunity } from "@/components/ui/CardCommunity";
import { CardWorkspace } from "@/components/ui/CardWorkSpace";

export default function Gallery() {
  return (
    <>
      <div className="flex flex-col max-w-full px-4 py-8 md:px-8 md:py-12 lg:px-20 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            From the WorkSpace
          </h1>

          <div className="flex items-center">
            <button className="text-base md:text-lg text-white font-bold hover:bg-gray-500 px-3 py-2 rounded-lg transition-colors">
              View All
            </button>
          </div>
        </div>

        <div className="w-full">
          {/* Ensure the grid component can shrink on small screens; wrapper provides full width */}
          <CardWorkspace />
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-10 gap-4 mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            From the Community
          </h1>

          <div className="flex items-center">
            <button className="text-base md:text-lg text-white font-bold hover:bg-gray-500 px-3 py-2 rounded-lg transition-colors">
              View All
            </button>
          </div>
        </div>

        <div className="w-full">
          {/* Ensure the grid component can shrink on small screens; wrapper provides full width */}
          <CardCommunity />
        </div>
      </div>
    </>
  );
}
