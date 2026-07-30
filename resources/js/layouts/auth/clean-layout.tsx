import type { ReactNode } from 'react';

export default function CleanLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans antialiased">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
