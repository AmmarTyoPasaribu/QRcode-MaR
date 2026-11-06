import { SITE } from "@/config/site";
import LogoMark from "@/components/ui/LogoMark";
import ThemeToggle from "./ThemeToggle";
import s from "./layout.module.css";

const NAV = [
  { href: "#generator", label: "Generator" },
  { href: "#riwayat", label: "Riwayat" },
];

export default function Header() {
  return (
    <header className={s.header}>
      <div className={`container ${s.headerInner}`}>
        <a href="#" className={s.brand} aria-label={`${SITE.name} — ke atas`}>
          <LogoMark size={36} />
          <span className={s.brandText}>
            QR Code <em>MaR</em>
          </span>
        </a>
        <nav className={s.nav} aria-label="Navigasi utama">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className={s.headerActions}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
