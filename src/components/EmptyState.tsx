import { Card, CardContent } from "@/components/ui/card";
import { QrCode, CreditCard, Shield } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="shadow-lg border-2 border-dashed">
      <CardContent className="py-12">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
            <QrCode className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Seu QR Code aparecerá aqui</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Preencha os dados do pagamento ao lado para gerar seu código Pix
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Pagamento instantâneo</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Seguro e confiável</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
