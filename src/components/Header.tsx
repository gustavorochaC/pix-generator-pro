import { Wallet } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg shadow-sm">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Gerador Pix</h1>
            <p className="text-xs text-muted-foreground">Pagamentos instantâneos</p>
          </div>
        </div>
      </div>
    </header>
  );
}
