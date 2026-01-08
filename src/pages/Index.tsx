import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { PaymentForm, type PaymentFormData } from "@/components/PaymentForm";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { EmptyState } from "@/components/EmptyState";

const Index = () => {
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const handleGenerate = useCallback((data: PaymentFormData) => {
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
              Crie QR Codes de pagamento válidos com checksum CRC16
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <PaymentForm onGenerate={handleGenerate} />
            </div>
            
            <div>
              {paymentData ? (
                <QRCodeDisplay
                  data={paymentData}
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
            Gerador de códigos Pix compatível com o padrão EMV QR Code. Use apenas com suas próprias chaves Pix.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
