import { useState } from "react";
import { X, Send, Loader2, MessageCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUBJECTS = [
  "Question about item",
  "Negotiate price",
  "Delivery arrangement",
  "Item condition inquiry",
  "Other",
];

const MAX_CHARS = 500;

interface MessageSellerModalProps {
  open: boolean;
  orderId?: string;
  merchantName?: string;
  onClose: () => void;
  onMessageSent?: (messageId: string) => void;
}

const MessageSellerModal = ({
  open,
  orderId,
  merchantName = "Seller",
  onClose,
  onMessageSent,
}: MessageSellerModalProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    if (!subject) { setError("Please select a subject"); return; }
    if (!message.trim()) { setError("Please enter a message"); return; }
    setError(null);
    setSending(true);

    setTimeout(() => {
      setSending(false);
      setSent(true);
      onMessageSent?.(`MSG-${Date.now().toString(36)}`);
      setTimeout(() => { setSent(false); setSubject(""); setMessage(""); onClose(); }, 1500);
    }, 1500);
  };

  const handleClose = () => {
    if (sending) return;
    setSubject("");
    setMessage("");
    setError(null);
    setSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-primary-foreground relative">
              <button
                onClick={handleClose}
                disabled={sending}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={18} />
                <span className="text-xs font-medium opacity-90">Message Seller</span>
              </div>
              <p className="text-lg font-bold">{merchantName}</p>
              {orderId && (
                <p className="text-xs opacity-80 mt-0.5">Re: Order #{orderId}</p>
              )}
            </div>

            {sent ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check size={28} className="text-primary-foreground" />
                </motion.div>
                <p className="font-semibold text-foreground">Message Sent! ✉️</p>
                <p className="text-xs text-muted-foreground">The seller will get back to you soon</p>
              </div>
            ) : (
              <>
                {/* Form */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Subject</label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSubject(s); setError(null); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            subject === s
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-muted-foreground/40"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_CHARS) {
                          setMessage(e.target.value);
                          setError(null);
                        }
                      }}
                      placeholder="Type your message to the seller..."
                      rows={4}
                      disabled={sending}
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
                    />
                    <p className={`text-[11px] mt-1 text-right ${
                      message.length > MAX_CHARS * 0.9 ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {message.length}/{MAX_CHARS}
                    </p>
                  </div>

                  {orderId && (
                    <div className="p-3 rounded-xl bg-muted/50">
                      <p className="text-[11px] text-muted-foreground">
                        📎 Order reference <span className="font-semibold text-foreground">#{orderId}</span> will be included
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={sending}
                    className="flex-1 py-3 rounded-xl bg-muted text-sm font-medium text-foreground active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={sending ? {} : { scale: 0.95 }}
                    onClick={handleSend}
                    disabled={sending}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      subject && message.trim() && !sending
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {sending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageSellerModal;
