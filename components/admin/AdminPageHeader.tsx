import { Button } from "@/components/ui/button";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  action?: string;
};

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-white/10 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#03B7B2]">OMAZYNC Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      {action ? <Button className="rounded-md">{action}</Button> : null}
    </div>
  );
}
