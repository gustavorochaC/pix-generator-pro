import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { PaymentForm } from "@/components/PaymentForm";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { EmptyState } from "@/components/EmptyState";

interface PaymentData {
  amount: number;
  description: string;
  expiresAt: Date;
}

const Index = () => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const handleGenerate = useCallback((data: PaymentData) => {
    setPaymentData(data);
    setIsExpired(false);
  }, []);

  const handleExpired = useCallback(() => {
    setIsExpired(true);
  }, []);

  const handleReset = useCallback(() => {
    setPaymentData(null);
    setIsExpired(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Gere seu código Pix em segundos
            </h2>
            <p className="text-muted-foreground">
              Crie QR Codes de pagamento personalizados de forma rápida e segura
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <PaymentForm onGenerate={handleGenerate} />
            </div>
            
            <div>
              {paymentData ? (
                <QRCodeDisplay
                  amount={paymentData.amount}
                  description={paymentData.description}
                  expiresAt={paymentData.expiresAt}
                  onExpired={handleExpired}
                  onReset={handleReset}
                />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Gerador de códigos Pix para fins demonstrativos. Não processa pagamentos reais.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
