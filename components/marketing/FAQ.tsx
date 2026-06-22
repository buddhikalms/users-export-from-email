const faqs = [
  {
    question: "Does ChatUp work with Outlook?",
    answer:
      "Yes. ChatUp connects to Outlook through IMAP and can scan selected folders to extract sender, reply-to, and forwarded-chain contacts.",
  },
  {
    question: "Can I export contacts to Excel or CSV?",
    answer:
      "Yes. You can export cleaned contacts folder-wise to Excel, CSV, or JSON, then use sync history to track completed exports.",
  },
  {
    question: "Which marketing platforms are supported?",
    answer:
      "ChatUp supports Kit, Mailchimp, Brevo, HubSpot, Beehiiv, and several queue-ready platform workflows.",
  },
  {
    question: "Are API keys and IMAP passwords stored safely?",
    answer:
      "Credentials are protected by an encrypted vault workflow designed to avoid plain-text API keys and mailbox passwords.",
  },
];

export function FAQ() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {faqs.map((faq) => (
        <article key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
          <h3 className="font-semibold text-slate-950 dark:text-white">{faq.question}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p>
        </article>
      ))}
    </div>
  );
}
