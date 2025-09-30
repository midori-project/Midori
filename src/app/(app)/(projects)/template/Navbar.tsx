export default function Navbar(){
    return (
      <nav className="w-full bg-white/70 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between py-3">
          <div className="brand text-{primary}-700 font-bold">{brand}</div>
          <ul className="flex gap-6">{menuItems}</ul>
        </div>
      </nav>
    );
  }