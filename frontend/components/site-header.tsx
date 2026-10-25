"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "تحلیل تصویر", icon: "scan" },
  { href: "/presentation", label: "ارائه", icon: "presentation" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="پالس، صفحه اصلی">
          <span className="brand-mark">
            <Icon name="activity" size={20} strokeWidth={2} />
          </span>
          <span className="brand-text">
            <strong>پالس</strong>
            <small>PULSE · Research</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="ناوبری اصلی">
          {links.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`site-nav-link${isActive ? " is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
                <Icon name={link.icon} size={17} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
