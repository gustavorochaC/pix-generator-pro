import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Clock, AlertCircle, RefreshCw, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { generatePixPayload, detectPixKeyType, getKeyTypeLabel } from "@/lib/pix-generator";
import type { PaymentFormData } from "./PaymentForm";

interface QRCodeDisplayProps {
  data: PaymentFormData;
  onExpired: () => void;
  onReset: () => void;
}

export function QRCodeDisplay({ data, onExpired, onReset }: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate valid Pix BRCode payload
  const pixCode = useMemo(() => {
    return generatePixPayload({
      pixKey: data.pixKey,
      merchantName: data.merchantName,
      merchantCity: data.merchantCity,
      amount: data.amount,
      description: data.description,
    });
  }, [data]);

  const keyType = useMemo(() => detectPixKeyType(data.pixKey), [data.pixKey]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = data.expiresAt.getTime();
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
  }, [data.expiresAt, onExpired]);

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
      <CardHeader className="text-center space-y-2 pb-4">
        <CardTitle className="text-xl">Pagamento Pix</CardTitle>
        <div className="text-3xl font-bold text-primary font-mono">
          {formatCurrency(data.amount)}
        </div>
        
        {/* Recipient Info */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {data.merchantName}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {data.merchantCity}
          </span>
        </div>

        {/* Key Type Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
            {getKeyTypeLabel(keyType)}
          </span>
        </div>
        
        {data.description && (
          <p className="text-sm text-muted-foreground mt-2">{data.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="relative flex justify-center">
          <div className={`p-4 bg-card rounded-xl border-2 ${isExpired ? "opacity-30" : ""}`}>
            <QRCodeSVG
              value={pixCode}
              size={200}
              level="M"
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

        {/* Pix Copia e Cola */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Pix Copia e Cola
          </Label>
          <div className="relative">
            <div className="p-3 bg-secondary/50 rounded-lg border font-mono text-xs break-all max-h-20 overflow-y-auto">
              {pixCode}
            </div>
          </div>
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

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}
