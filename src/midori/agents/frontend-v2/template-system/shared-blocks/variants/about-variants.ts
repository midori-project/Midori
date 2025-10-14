import { BlockVariant } from "../index";

export const aboutVariants: BlockVariant[] = [
  {
    id: "about-basic",
    name: "Basic About",
    description: "Simple about section with features and stats",
    template: `export default function About() {
  return (
    <section className="py-16 bg-{primary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-{primary}-900 mb-6">{title}</h2>
          <p className="text-lg text-{primary}-700 mb-8 leading-relaxed">{description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {features}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats}
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  }
];