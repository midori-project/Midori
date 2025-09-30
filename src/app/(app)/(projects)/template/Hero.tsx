export default function Hero(){
    return (
      <section className="py-16 bg-{primary}-{bgTone}">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-{primary}-800">{heading}</h1>
          <p className="mt-4 text-{primary}-700">{subheading}</p>
          <a className="inline-block mt-6 px-6 py-3 rounded bg-{accentColor}-600 text-white">{ctaLabel}</a>
        </div>
      </section>
    );
  }