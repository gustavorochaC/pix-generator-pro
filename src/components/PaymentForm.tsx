import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, QrCode, Clock, User, MapPin, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { detectPixKeyType, getKeyTypeLabel, isValidPixKey, type PixKeyType } from "@/lib/pix-generator";

export interface PaymentFormData {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  description: string;
  expiresAt: Date;
}

interface PaymentFormProps {
  onGenerate: (data: PaymentFormData) => void;
}

const EXPIRATION_PRESETS = [
  { value: "15", label: "15 minutos" },
  { value: "60", label: "1 hora" },
  { value: "1440", label: "24 horas" },
  { value: "custom", label: "Personalizado" },
];

export function PaymentForm({ onGenerate }: PaymentFormProps) {
  const [pixKey, setPixKey] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [merchantCity, setMerchantCity] = useState("SAO PAULO");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expirationPreset, setExpirationPreset] = useState("15");
  const [customDate, setCustomDate] = useState<Date>();
  const [customTime, setCustomTime] = useState("12:00");

  const keyType = useMemo((): PixKeyType => {
    return detectPixKeyType(pixKey);
  }, [pixKey]);

  const isKeyValid = useMemo(() => {
    return isValidPixKey(pixKey);
  }, [pixKey]);

  const formatCurrency = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "");
    const cents = parseInt(digits || "0", 10);
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
    return formatted;
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setAmount(formatted);
  };

  const parseAmount = (formattedAmount: string): number => {
    const digits = formattedAmount.replace(/\D/g, "");
    return parseInt(digits || "0", 10) / 100;
  };

  const handleMerchantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 25);
    setMerchantName(value);
  };

  const handleMerchantCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 15);
    setMerchantCity(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pixKey.trim()) {
      toast.error("Por favor, insira sua chave Pix");
      return;
    }

    if (!isKeyValid) {
      toast.error("Formato de chave Pix inválido", {
        description: "Use CPF, CNPJ, e-mail, telefone ou chave aleatória"
      });
      return;
    }

    if (!merchantName.trim()) {
      toast.error("Por favor, insira o nome do beneficiário");
      return;
    }

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
      pixKey: pixKey.trim(),
      merchantName: merchantName.trim(),
      merchantCity: merchantCity.trim() || "SAO PAULO",
      amount: parsedAmount,
      description: description.trim(),
      expiresAt,
    });
    
    toast.success("QR Code Pix gerado com sucesso!");
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Gerar Pagamento Pix</CardTitle>
        </div>
        <CardDescription>
          Preencha os dados para gerar um código Pix válido
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pix Key Input */}
          <div className="space-y-2">
            <Label htmlFor="pixKey" className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Chave Pix *
            </Label>
            <div className="relative">
              <Input
                id="pixKey"
                type="text"
                placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className={cn(
                  "h-11 min-h-[44px] pr-3 sm:pr-24",
                  pixKey && (isKeyValid ? "border-primary/50" : "border-destructive/50")
                )}
              />
              {pixKey && (
                <>
                  {/* Badge visível apenas em desktop (dentro do input) */}
                  <div className={cn(
                    "hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 rounded text-xs font-medium z-10",
                    isKeyValid 
                      ? "bg-primary/10 text-primary" 
                      : "bg-destructive/10 text-destructive"
                  )}>
                    {isKeyValid ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {getKeyTypeLabel(keyType)}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Inválido
                      </>
                    )}
                  </div>
                  {/* Badge visível apenas em mobile (abaixo do input) */}
                  <div className={cn(
                    "flex sm:hidden items-center gap-1 px-2 py-1 rounded text-xs font-medium mt-1",
                    isKeyValid 
                      ? "bg-primary/10 text-primary" 
                      : "bg-destructive/10 text-destructive"
                  )}>
                    {isKeyValid ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {getKeyTypeLabel(keyType)}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Inválido
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Merchant Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchantName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome do Beneficiário *
              </Label>
              <Input
                id="merchantName"
                type="text"
                placeholder="Seu nome ou empresa"
                value={merchantName}
                onChange={handleMerchantNameChange}
                maxLength={25}
                className="h-11 min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {merchantName.length}/25
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchantCity" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cidade
              </Label>
              <Input
                id="merchantCity"
                type="text"
                placeholder="SAO PAULO"
                value={merchantCity}
                onChange={handleMerchantCityChange}
                maxLength={15}
                className="h-11 min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {merchantCity.length}/15
              </p>
            </div>
          </div>

          {/* Amount Input */}
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
              className="text-base sm:text-lg font-mono h-12 min-h-[44px]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Pagamento de serviços, Compra de produto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Validade do QR Code
            </Label>
            <Select value={expirationPreset} onValueChange={setExpirationPreset}>
              <SelectTrigger className="h-11 min-h-[44px]">
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
                        "w-full justify-start text-left font-normal h-11 min-h-[44px]",
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
                  className="h-11 min-h-[44px]"
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            size="lg" 
            className="w-full min-h-[44px] h-11 sm:h-12 text-sm sm:text-base font-semibold"
            disabled={!pixKey || !isKeyValid || !merchantName}
          >
            <QrCode className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Gerar QR Code Pix
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
