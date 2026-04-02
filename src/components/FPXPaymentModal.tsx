import { useState } from "react";
import { X, Check, AlertCircle, Loader2, Shield, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MALAYSIAN_BANKS = [
  { code: "MBB0227", name: "Maybank", short: "MBB" },
  { code: "BCBB0235", name: "CIMB Bank", short: "CIMB" },
  { code: "PBB0233", name: "Public Bank", short: "PBB" },
  { code: "RHB0218", name: "RHB Bank", short: "RHB" },
  { code: "HLB0224", name: "Hong Leong Bank", short: "HLB" },
  { code: "AMBB0209", name: "AmBank", short: "AMB" },
  { code: "BIMB0340", name: "Bank Islam", short: "BIMB" },
  { code: "BMMB0341", name: "Bank Muamalat", short: "BMMB" },
  { code: "ABB0233", name: "Affin Bank", short: "ABB" },
  { code: "ABMB0212", name: "Alliance Bank", short: "ALMB" },
  { code: "BSN0601", name: "BSN", short: "BSN" },
  { code: "HSBC0223", name: "HSBC Bank", short: "HSBC" },
  { code: "KFH0346", name: "Kuwait Finance House", short: "KFH" },
  { code: "OCBC0229", name: "OCBC Bank", short: "OCBC" },
  { code: "SCB0216", name: "Standard Chartered", short: "SCB" },
  { code: "UOB0226", name: "UOB Bank", short: "UOB" },
  { code: "BKRM0602", name: "Bank Rakyat", short: "BKRM" },
  { code: "AGRO0001", name: "Agrobank", short: "AGRO" },
];

interface FPXPaymentModalProps {
  open: boolean;
  amount: number;
  orderId: string;
  merchantName?: string;
  onClose: () => void;
  onSuccess: (paymentUrl: string) => void;
  onError: (error: string) => void;
}

const FPXPaymentModal = ({
  open,
  amount,
  orderId,
  merchantName = "PantrySave",
  onClose,
  onSuccess,
  onError,
}: FPXPaymentModalProps) => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!selectedBank) {
      setError("Please select a bank to proceed");
      return;
    }
    setError(null);
    setLoading(true);

    // Simulate FPX API call
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        const paymentUrl = `https://www.mepsfpx.com.my/FPXMain/seller2D498.jsp?orderId=${orderId}&bank=${selectedBank}`;
        setLoading(false);
        onSuccess(paymentUrl);
      } else {
        setLoading(false);
        onError("Payment initiation failed. Please try again.");
        setError("Payment initiation failed. Please try again.");
      }
    }, 2000);
  };

  const selectedBankData = MALAYSIAN_BANKS.find((b) => b.code === selectedBank);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-primary-foreground relative">
              <button
                onClick={onClose}
                disabled={loading}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={18} />
                <span className="text-xs font-medium opacity-90">FPX Online Banking</span>
              </div>
              <p className="text-2xl font-bold">RM {amount.toFixed(2)}</p>
              <p className="text-xs opacity-80 mt-0.5">
                Order #{orderId} · {merchantName}
              </p>
            </div>

            {/* Bank List */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Select your bank</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 mb-3 rounded-xl bg-destructive/10 text-destructive text-xs"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {MALAYSIAN_BANKS.map((bank) => (
                  <button
                    key={bank.code}
                    disabled={loading}
                    onClick={() => {
                      setSelectedBank(bank.code);
                      setError(null);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedBank === bank.code
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        selectedBank === bank.code
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {bank.short.slice(0, 3)}
                    </div>
                    <span className="text-xs font-medium text-foreground truncate flex-1">
                      {bank.name}
                    </span>
                    {selectedBank === bank.code && (
                      <Check size={14} className="text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3 rounded-xl bg-muted/50 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-muted-foreground" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Important
                  </p>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Do not close your browser during payment</li>
                  <li>You will be redirected to your bank's portal</li>
                  <li>Complete the payment within 10 minutes</li>
                  <li>Ensure your internet connection is stable</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-2">
              <button
                onClick={() => setShowSellerMessage(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-50"
              >
                <MessageCircle size={14} />
                Contact Seller
              </button>
              {selectedBankData && (
                <p className="text-xs text-muted-foreground text-center">
                  Paying <span className="font-semibold text-foreground">RM {amount.toFixed(2)}</span> via{" "}
                  <span className="font-semibold text-foreground">{selectedBankData.name}</span>
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-muted text-sm font-medium text-foreground active:scale-95 transition-transform disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={loading ? {} : { scale: 0.95 }}
                  onClick={handlePay}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    selectedBank && !loading
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          <MessageSellerModal
            open={showSellerMessage}
            orderId={orderId}
            merchantName={merchantName}
            onClose={() => setShowSellerMessage(false)}
            onMessageSent={() => toast.success("Message sent to seller! ✉️")}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FPXPaymentModal;
