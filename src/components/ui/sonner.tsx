import { Toaster as Sonner, toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { effectiveTheme } = useTheme();

  return (
    <Sonner
      theme={effectiveTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            effectiveTheme === "dark"
              ? "group toast group-[.toaster]:bg-slate-800 group-[.toaster]:text-white group-[.toaster]:border-slate-700 group-[.toaster]:shadow-lg"
              : "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
          description:
            effectiveTheme === "dark"
              ? "group-[.toast]:text-slate-400"
              : "group-[.toast]:text-slate-600",
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-white",
          cancelButton:
            effectiveTheme === "dark"
              ? "group-[.toast]:bg-slate-700 group-[.toast]:text-slate-300"
              : "group-[.toast]:bg-slate-200 group-[.toast]:text-slate-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
