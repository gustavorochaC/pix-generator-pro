import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, QrCode, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentFormProps {
  onGenerate: (data: { amount: number; description: string; expiresAt: Date }) => void;
}

const EXPIRATION_PRESETS = [
  { value: "15", label: "15 minutos" },
  { value: "60", label: "1 hora" },
  { value: "1440", label: "24 horas" },
  { value: "custom", label: "Personalizado" },
];

export function PaymentForm({ onGenerate }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expirationPreset, setExpirationPreset] = useState("15");
  const [customDate, setCustomDate] = useState<Date>();
  const [customTime, setCustomTime] = useState("12:00");

  const formatCurrency = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    // Convert to number (cents)
    const cents = parseInt(digits || "0", 10);
    // Format as BRL
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setAmount(formatted);
  };

  const parseAmount = (formattedAmount: string): number => {
    const digits = formattedAmount.replace(/\D/g, "");
    return parseInt(digits || "0", 10) / 100;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseAmount(amount);
    
    if (parsedAmount <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    let expiresAt: Date;
    
    if (expirationPreset === "custom") {
      if (!customDate) {
        toast.error("Por favor, selecione uma data de expiração");
        return;
      }
      const [hours, minutes] = customTime.split(":").map(Number);
      expiresAt = new Date(customDate);
      expiresAt.setHours(hours, minutes, 0, 0);
      
      if (expiresAt <= new Date()) {
        toast.error("A data de expiração deve ser no futuro");
        return;
      }
    } else {
      expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expirationPreset, 10));
    }

    onGenerate({
      amount: parsedAmount,
      description: description.trim(),
      expiresAt,
    });
    
    toast.success("QR Code Pix gerado com sucesso!");
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Gerar Pagamento Pix</CardTitle>
        </div>
        <CardDescription>
          Preencha os dados abaixo para gerar seu código de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Valor do Pagamento *
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={amount}
              onChange={handleAmountChange}
              className="text-lg font-mono h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição do Pagamento
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Pagamento de serviços, Compra de produto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Validade do QR Code
            </Label>
            <Select value={expirationPreset} onValueChange={setExpirationPreset}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione a validade" />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATION_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {expirationPreset === "custom" && (
            <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data de Expiração</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !customDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDate
                        ? format(customDate, "PPP", { locale: ptBR })
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDate}
                      onSelect={setCustomDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customTime" className="text-sm font-medium">
                  Horário
                </Label>
                <Input
                  id="customTime"
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold">
            <QrCode className="mr-2 h-5 w-5" />
            Gerar QR Code Pix
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
