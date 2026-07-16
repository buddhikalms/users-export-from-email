"use client";

import { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";

const bookingUrl =
  "https://www.timetide.app/buddhikalms2002/omazync-com?embed=true&accent=00b6ae&mode=light";
const avatarUrl =
  "https://lh3.googleusercontent.com/a/ACg8ocJFjB4P9VZ7RxNGptfundqccgbsC-a4rGc9qNWV2hGdVh2WUg=s96-c";

export function BookingEmbed() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <button
        className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#00b6ae] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_42px_-18px_rgba(0,182,174,0.75)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-20px_rgba(0,182,174,0.85)] sm:w-auto"
        type="button"
        onClick={() => setOpen(true)}
      >
        <img
          alt=""
          className="h-9 w-9 rounded-full border-2 border-white/30 object-cover"
          src={avatarUrl}
        />
        <span>Schedule a meeting</span>
        <CalendarDays className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label="Schedule a meeting"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative h-[88vh] max-h-[720px] w-full max-w-[480px] overflow-hidden rounded-[20px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-slate-700 transition hover:bg-black/10"
              type="button"
              aria-label="Close booking popup"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <iframe
              allow="payment"
              className="h-full w-full border-0"
              loading="lazy"
              src={bookingUrl}
              title="Schedule a meeting with OMAZYNC"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
