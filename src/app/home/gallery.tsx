import { CardCommunity } from "@/components/ui/CardCommunity";
import { CardWorkspace } from "@/components/ui/CardWorkspace";
import { getCurrentSession } from "@/libs/auth/session";

export default async function Gallery() {
  // ตรวจสอบ authentication status
  const session = await getCurrentSession();
  const isLoggedIn = session?.user?.id;

  return (
    <>
      <div className="flex flex-col max-w-full px-4 py-8 md:px-8 md:py-12 lg:px-20 lg:py-20 bg-[#68A36940] rounded-2xl">
        {/* แสดง WorkSpace section เฉพาะเมื่อ login แล้ว */}
        {isLoggedIn && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-10">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B2604]">
                From the WorkSpace
              </h1>
              
              <div className="flex items-center">
                <a 
                  href="/projects/workspace"
                    className="text-base md:text-lg text-[#0B2604] font-bold hover:bg-gray-500 px-3 py-2 rounded-lg transition-colors"
                  >
                  View All
                </a>
              </div>
            </div>

            <div className="w-full">
              {/* Ensure the grid component can shrink on small screens; wrapper provides full width */}
              <CardWorkspace showLimited={true} />
            </div>
          </>
        )}

        {/* แสดง Community section เสมอ แต่ปรับ spacing ตามสถานะ login */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-10 ${isLoggedIn ? 'pt-10' : ''}`}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B2604]">
            From the Community
          </h1>

          <div className="flex items-center">
            <a 
              href="/projects/community"
              className="text-base md:text-lg text-[#0B2604] font-bold hover:bg-gray-500 px-3 py-2 rounded-lg transition-colors"
            >
              View All
            </a>
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
