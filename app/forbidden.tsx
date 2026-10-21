import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-4 shadow-sm">
        <div className="size-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="size-7" />
        </div>
        <div>
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
            Error 403
          </span>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white mt-1">
            Acceso no autorizado
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
            No tienes los permisos necesarios para acceder a este recurso. Esta sección está reservada exclusivamente para instructores.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/campus"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Volver a Mi Campus</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
