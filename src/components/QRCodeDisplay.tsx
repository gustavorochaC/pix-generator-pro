import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  amount: number;
  description: string;
  expiresAt: Date;
  onExpired: () => void;
  onReset: () => void;
}

export function QRCodeDisplay({ amount, description, expiresAt, onExpired, onReset }: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a simulated Pix code
  const generatePixCode = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const amountStr = Math.round(amount * 100).toString().padStart(10, "0");
    const randomId = Math.random().toString(36).substring(2, 15);
    
    // Simulated Pix EMV format-like string
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${randomId}520400005303986540${amount.toFixed(2)}5802BR5925GERADOR PIX LOVABLE6009SAO PAULO62070503***6304${timestamp.toUpperCase()}`;
    
    return pixCode;
  }, [amount]);

  const pixCode = generatePixCode();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = expiresAt.getTime();
      const difference = expiry - now;
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        onExpired();
        return;
      }
      
      setTimeLeft(Math.floor(difference / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCopy = async () => {
    if (isExpired) return;
    
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success("Código Pix copiado!", {
        description: "Cole no app do seu banco para pagar",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar", {
        description: "Tente novamente",
      });
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 60) return "text-destructive";
    if (timeLeft <= 300) return "text-orange-500";
    return "text-primary";
  };

  return (
    <Card className={`shadow-lg border-2 transition-all duration-300 ${isExpired ? "border-destructive/50 bg-destructive/5" : ""}`}>
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-xl">Pagamento Pix</CardTitle>
        <div className="text-3xl font-bold text-primary font-mono">
          {formatCurrency(amount)}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex justify-center">
          <div className={`p-4 bg-card rounded-xl border-2 ${isExpired ? "opacity-30" : ""}`}>
            <QRCodeSVG
              value={pixCode}
              size={200}
              level="H"
              includeMargin
              bgColor="transparent"
              fgColor="currentColor"
              className="text-foreground"
            />
          </div>
          
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">QR Code Expirado</span>
              </div>
            </div>
          )}
        </div>

        <div className={`flex items-center justify-center gap-2 text-lg font-mono ${getTimerColor()}`}>
          <Clock className="h-5 w-5" />
          <span>
            {isExpired ? "Expirado" : `Expira em: ${formatTime(timeLeft)}`}
          </span>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleCopy}
            disabled={isExpired}
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                Copiar Código Pix
              </>
            )}
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Gerar Novo Código
          </Button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Escaneie o QR Code com o app do seu banco ou copie o código para realizar o pagamento via Pix Copia e Cola.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
