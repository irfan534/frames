import Link from "next/link";
import { Baby, Glasses, Monitor, Sparkles, Sun } from "lucide-react";

const categories = [
  { label: "Eyeglasses", icon: Glasses },
  { label: "Sunglasses", icon: Sun },
  { label: "Contact Lenses", icon: Sparkles },
  { label: "Kids Frames", icon: Baby },
  { label: "Computer Glasses", icon: Monitor }
];

export function CategoryStrip() {
  return (
    <section className="bg-white py-8">
      <div className="container-page">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
          {categories.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              href={`/products?category=${encodeURIComponent(label)}`}
              className="min-w-[190px] rounded-lg border border-border bg-optical-shell p-5 transition duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <span className="mt-4 block font-semibold">{label}</span>
              <span className="mt-1 block text-sm text-optical-muted">Shop collection</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
