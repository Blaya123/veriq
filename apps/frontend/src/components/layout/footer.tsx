import Link from "next/link";
import { COMPANY, NAV_ITEMS } from "@/lib/constants";

const footerLinks = {
  Product: NAV_ITEMS.map((i) => i.label),
  Company: ["About", "Blog", "Careers", "Press"],
  Support: ["Documentation", "API Reference", "Status", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                {COMPANY.name}
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
              {COMPANY.description}
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:flex-row">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Twitter", "GitHub", "LinkedIn", "YouTube"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
