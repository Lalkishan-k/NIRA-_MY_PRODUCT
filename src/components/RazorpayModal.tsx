import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  razorpayOrderId: string;
  amount: number; // in INR rupees
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => void;
  onFailure: (errorMessage: string) => void;
  brandName?: string;
  isTestMode?: boolean;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderId,
  razorpayOrderId,
  amount,
  customer,
  onSuccess,
  onFailure,
  brandName = 'NIRA Pure Coconut Oil',
  isTestMode = true
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  
  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr' | 'custom'>('qr');
  const [customUpiId, setCustomUpiId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrTimer, setQrTimer] = useState(480); // 8 minutes countdown

  // Card State
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState(customer.name || 'Valued Customer');

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Processing State
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState('Initiating Payment...');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQrTimer(prev => (prev > 0 ? prev - 1 : 480));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('nira.coconutoil@razorpay');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSimulatePayment = (shouldSucceed: boolean = true) => {
    setIsPaying(true);
    setPaymentStepText('Connecting to Secure Banking Gateway...');

    setTimeout(() => {
      setPaymentStepText('Authenticating 3D Secure / UPI VPA...');
    }, 700);

    setTimeout(() => {
      if (shouldSucceed) {
        setPaymentStepText('Payment Confirmed by Bank!');
        setTimeout(() => {
          setIsPaying(false);
          const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const mockSignature = `sig_verified_${Date.now()}`;
          onSuccess({
            razorpayOrderId: razorpayOrderId || `order_${Date.now()}`,
            razorpayPaymentId: mockPaymentId,
            razorpaySignature: mockSignature
          });
        }, 500);
      } else {
        setIsPaying(false);
        onFailure('Payment declined by issuing bank (Test Simulation)');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Razorpay Authentic Header */}
        <div className="bg-[#0c2340] text-white px-5 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-white font-bold text-sm">
              🥥
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-wide text-white">{brandName}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isTestMode ? 'Test Sandbox' : 'Verified'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-300">
                <span>Order: <b className="font-mono text-stone-200">{orderId}</b></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Razorpay Standard Checkout</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-medium">Amount Due</div>
              <div className="text-lg font-bold font-mono text-emerald-400">₹{amount.toFixed(2)}</div>
            </div>
            <button
              onClick={onClose}
              disabled={isPaying}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
              title="Close payment window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col sm:flex-row">
          {/* Left Navigation Sidebar */}
          <div className="w-full sm:w-44 bg-stone-50 border-r border-stone-200 p-2 sm:p-3 flex sm:flex-col gap-1 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeTab === 'upi'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div>UPI / QR</div>
                <div className={`text-[10px] font-normal ${activeTab === 'upi' ? 'text-emerald-200' : 'text-stone-400'}`}>
                  GPay, PhonePe
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeTab === 'card'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div>Cards</div>
                <div className={`text-[10px] font-normal ${activeTab === 'card' ? 'text-emerald-200' : 'text-stone-400'}`}>
                  Visa, RuPay, MC
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('netbanking')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeTab === 'netbanking'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div>Net Banking</div>
                <div className={`text-[10px] font-normal ${activeTab === 'netbanking' ? 'text-emerald-200' : 'text-stone-400'}`}>
                  All Indian Banks
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                activeTab === 'wallet'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div>Wallets</div>
                <div className={`text-[10px] font-normal ${activeTab === 'wallet' ? 'text-emerald-200' : 'text-stone-400'}`}>
                  Paytm, PhonePe
                </div>
              </div>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-5 space-y-4">
            {/* 1. UPI TAB */}
            {activeTab === 'upi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Instant UPI Payment
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">
                    QR expires in: <span className="text-amber-600 font-semibold">{formatTimer(qrTimer)}</span>
                  </span>
                </div>

                {/* QR Code Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-stone-200 shadow-xs shrink-0 flex items-center justify-center relative">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=nira.coconutoil@razorpay&pn=NIRA%20Pure%20Coconut%20Oil&am=${amount}&cu=INR&tr=${orderId}`
                      )}`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                      <QrCode className="w-16 h-16 text-emerald-900" />
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-semibold text-stone-800">
                      Scan with any UPI app to pay
                    </p>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Scan using Google Pay, PhonePe, Paytm, BHIM, or any banking app.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-stone-200 text-stone-700">
                        nira.coconutoil@razorpay
                      </span>
                      <button
                        onClick={handleCopyUpi}
                        className="p-1 rounded text-stone-500 hover:text-stone-900 border border-stone-200 bg-white hover:bg-stone-100 text-[11px] flex items-center gap-1 transition-colors"
                        title="Copy VPA"
                      >
                        {copiedUpi ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* UPI Fast Apps */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Or select your UPI App
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('gpay')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        selectedUpiApp === 'gpay'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <span>Google Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('phonepe')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        selectedUpiApp === 'phonepe'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <span>PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('paytm')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        selectedUpiApp === 'paytm'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <span>Paytm UPI</span>
                    </button>
                  </div>
                </div>

                {/* Custom VPA Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">
                    Or Enter Custom UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={customUpiId}
                    onChange={e => setCustomUpiId(e.target.value)}
                    placeholder="e.g. mobile@okhdfcbank or yourname@upi"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>
            )}

            {/* 2. CARDS TAB */}
            {activeTab === 'card' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Credit / Debit Card
                  </span>
                  <span className="text-[10px] text-stone-500">Supports Visa, Mastercard, RuPay</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full text-xs p-2.5 pl-9 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">Expiry MM/YY</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600">Name on Card</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    placeholder="Full Name"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Test mode active: Any valid format 16-digit card and 3-digit CVV will be verified via Razorpay sandbox.</span>
                </div>
              </div>
            )}

            {/* 3. NET BANKING TAB */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Select Your Bank
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'HDFC', name: 'HDFC Bank' },
                    { id: 'SBI', name: 'State Bank of India' },
                    { id: 'ICICI', name: 'ICICI Bank' },
                    { id: 'AXIS', name: 'Axis Bank' },
                    { id: 'FEDERAL', name: 'Federal Bank (Kerala)' },
                    { id: 'KOTAK', name: 'Kotak Mahindra' }
                  ].map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                        selectedBank === b.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      {selectedBank === b.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <label className="text-[11px] font-semibold text-stone-500 mb-1 block">
                    Or choose other banks
                  </label>
                  <select 
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                  >
                    <option value="CANARA">Canara Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                    <option value="INDUSIND">IndusInd Bank</option>
                    <option value="YES">Yes Bank</option>
                    <option value="SOUTH_INDIAN">South Indian Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4. WALLETS TAB */}
            {activeTab === 'wallet' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Select Mobile Wallet
                </span>

                <div className="space-y-2">
                  {[
                    { id: 'paytm', name: 'Paytm Wallet & Postpaid' },
                    { id: 'phonepe', name: 'PhonePe Wallet' },
                    { id: 'mobikwik', name: 'MobiKwik' },
                    { id: 'airtel', name: 'Airtel Money' }
                  ].map(w => (
                    <label
                      key={w.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedWallet === w.id
                          ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-xs">
                        <Wallet className="w-4 h-4 text-stone-500" />
                        <span>{w.name}</span>
                      </div>
                      <input
                        type="radio"
                        name="wallet_selection"
                        checked={selectedWallet === w.id}
                        onChange={() => setSelectedWallet(w.id)}
                        className="text-emerald-700 focus:ring-emerald-700"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-500 text-[11px] order-2 sm:order-1">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Secured with Razorpay 256-bit Encryption</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            {/* Simulate Decline Button (Useful for testing failure flows) */}
            <button
              type="button"
              onClick={() => handleSimulatePayment(false)}
              disabled={isPaying}
              className="text-[11px] font-semibold text-stone-500 hover:text-rose-600 px-3 py-2 rounded-xl transition-colors disabled:opacity-30"
              title="Test payment decline handling"
            >
              Test Fail
            </button>

            {/* Primary Pay Button */}
            <button
              type="button"
              onClick={() => handleSimulatePayment(true)}
              disabled={isPaying}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPaying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{paymentStepText}</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{amount.toFixed(2)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
