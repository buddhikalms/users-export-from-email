import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "Product",
    links: [
      ["Features", "/features"],
      ["Integrations", "/integrations"],
      ["Pricing", "/pricing"],
      ["Security", "/security"],
    ],
  },
  {
    title: "Solutions",
    links: [
      ["Agencies", "/use-cases"],
      ["PR Teams", "/use-cases"],
      ["Publishers", "/use-cases"],
      ["Recruiters", "/use-cases"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Blog", "/blog"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_2fr] lg:px-8">
        <div>
          <Link className="flex items-center gap-3 font-semibold" href="/">
            <Image
              alt="Omazync"
              className="h-10 w-36 rounded-md object-cover"
              height={1024}
              src="/Omazync-logo.png"
              width={1536}
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
            Extract. Clean. Sync. Turn Outlook and IMAP folders into clean, marketing-ready contact data.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold">{column.title}</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                {column.links.map(([label, href]) => (
                  <Link key={href + label} className="hover:text-slate-950 dark:hover:text-white" href={href as any}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-slate-200 px-4 py-6 text-xs text-slate-500 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>© 2026 OMAZYNC. All rights reserved.</span>
        <span>Privacy-first email contact extraction and marketing sync.</span>
      </div>
    </footer>
  );
}
