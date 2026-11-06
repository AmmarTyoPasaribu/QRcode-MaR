import { SITE } from "@/config/site";
import Icon from "@/components/ui/Icon";
import LogoMark from "@/components/ui/LogoMark";
import s from "./layout.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={s.footer}>
      <div className={`container ${s.footerInner}`}>
        <div className={s.footerBrand}>
          <LogoMark size={44} />
          <div>
            <p className={s.footerName}>
              QR Code <em>MaR</em>
            </p>
            <p className={s.footerTag}>Dibuat di browser, tanpa server. Datamu tetap milikmu.</p>
          </div>
        </div>
      </div>
      <div className={`container ${s.footerBottom}`}>
        <p>
          © {year} {SITE.author}. Dibuat dengan <Icon name="heart" size={13} className={s.heart} /> di antara pepohonan.
        </p>
      </div>
    </footer>
  );
}
