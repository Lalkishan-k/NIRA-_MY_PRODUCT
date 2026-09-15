import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Building2,
  Package,
  ShieldCheck,
  Truck,
  Award,
  CheckCircle2,
  Send,
  Sparkles,
  Calculator,
  MessageSquare,
  FileText,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Tag,
  Download,
  Printer,
  HeartPulse,
  ShoppingBag,
  Utensils,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../context/StoreContext';
import { BulkEnquiry } from '../types';
import { openWhatsAppDirect } from '../utils/whatsappNotifications';

export const BulkEnquiryPage: React.FC = () => {
  const { addToast } = useStore();

  // Volume Estimator State
  const [can5LQty, setCan5LQty] = useState<number>(2);
  const [can15LQty, setCan15LQty] = useState<number>(1);
  const [bottle1LQty, setBottle1LQty] = useState<number>(0);
  const [bottle500mlQty, setBottle500mlQty] = useState<number>(0);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState<
    'Ayurvedic Wellness / Hospital' | 'Organic Retail Store' | 'Restaurant / Hospitality' | 'Wholesale Exporter' | 'Other'
  >('Ayurvedic Wellness / Hospital');
  const [gstNumber, setGstNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('');
  const [orderFrequency, setOrderFrequency] = useState<
    'One-time Order' | 'Monthly Subscription' | 'Quarterly Contract' | 'Weekly Restock'
  >('Monthly Subscription');
  const [estimatedMonthlyReq, setEstimatedMonthlyReq] = useState('100 - 250 Litres/month');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<BulkEnquiry | null>(null);

  // Calculate Total Litres
  const totalLitres =
    can5LQty * 5 +
    can15LQty * 15 +
    bottle1LQty * 1 +
    bottle500mlQty * 0.5;

  // Estimated Wholesale Pricing Matrix (Base retail ~₹380/L)
  // Bulk Tier Discounts: 25L+ => 12% off, 100L+ => 20% off, 300L+ => 25% off
  const baseRetailPerLitre = 380;
  let bulkDiscountPercent = 8;
  if (totalLitres >= 300) bulkDiscountPercent = 25;
  else if (totalLitres >= 100) bulkDiscountPercent = 20;
  else if (totalLitres >= 50) bulkDiscountPercent = 15;
  else if (totalLitres >= 25) bulkDiscountPercent = 12;

  const estimatedWholesalePerLitre = Math.round(baseRetailPerLitre * (1 - bulkDiscountPercent / 100));
  const estimatedOrderSubtotal = Math.round(totalLitres * estimatedWholesalePerLitre);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim()) {
      addToast('Please fill in all required business contact details.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitBulkEnquiry({
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        businessType,
        gstNumber: gstNumber.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim() || undefined,
        preferredPackaging: {
          can5L: can5LQty,
          can15L: can15LQty,
          bottle1L: bottle1LQty,
          bottle500ml: bottle500mlQty
        },
        totalEstimatedLitres: totalLitres,
        orderFrequency,
        estimatedMonthlyRequirement: estimatedMonthlyReq,
        additionalNotes: additionalNotes.trim() || undefined
      });

      setSubmittedEnquiry(res.enquiry);
      addToast(`Quotation request ${res.enquiry.referenceNumber} submitted successfully!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunchWhatsAppQuote = () => {
    if (!submittedEnquiry) return;
    const msg = `*NIRA B2B Wholesale Quote Request*\n\n` +
      `*Ref ID:* ${submittedEnquiry.referenceNumber}\n` +
      `*Business Name:* ${submittedEnquiry.businessName}\n` +
      `*Contact Person:* ${submittedEnquiry.contactPerson}\n` +
      `*Category:* ${submittedEnquiry.businessType}\n` +
      `*Location:* ${submittedEnquiry.city}, ${submittedEnquiry.state}\n` +
      `*GSTIN:* ${submittedEnquiry.gstNumber || 'Not provided'}\n\n` +
      `*Packaging Breakdown:*\n` +
      `• 15L Bulk Cans: ${can15LQty} units (${can15LQty * 15}L)\n` +
      `• 5L Jerrycans: ${can5LQty} units (${can5LQty * 5}L)\n` +
      `• 1L Glass Bottles: ${bottle1LQty} units\n` +
      `• 500ml Bottles: ${bottle500mlQty} units\n` +
      `*Total Volume:* ${totalLitres} Litres\n` +
      `*Estimated Subtotal:* ₹${estimatedOrderSubtotal.toLocaleString('en-IN')} (approx ${bulkDiscountPercent}% tier discount)\n\n` +
      `*Notes:* ${additionalNotes || 'Please send official tax invoice quotation & CoA certificate.'}`;

    // Direct WhatsApp to NIRA B2B Desk
    openWhatsAppDirect('919847123456', msg);
  };

  return (
    <div className="bg-stone-50 min-h-screen py-8 sm:py-12" id="bulk-enquiry-page">
      <Helmet>
        <title>B2B & Bulk Coconut Oil Quotation | NIRA Pure Kerala Coconut Oil</title>
        <meta
          name="description"
          content="Wholesale bulk coconut oil quotation for Ayurvedic wellness centers, organic grocery stores, restaurants, and exporters. 5L & 15L cans direct from Kozhikode mill with GST invoices."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO SECTION */}
        <div className="relative rounded-3xl bg-gradient-to-br from-amber-950 via-emerald-950 to-stone-900 text-white p-6 sm:p-12 overflow-hidden shadow-2xl border border-amber-900/30">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Institutional B2B & Wholesale Direct</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Bulk Pure Kerala Coconut Oil for Commercial & Wellness Leaders
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Expeller-pressed from selected Kozhikode sun-dried copra. Tailored wholesale supply in 5L & 15L bulk cans with FSSAI compliance, lab analysis certificates, and GST tax credit invoicing.
            </p>

            {/* Quick Badges */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-stone-200">
              <div className="flex items-center space-x-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Grade-A Copra Only</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>FFA &lt; 0.5% Certified</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                <FileText className="w-4 h-4 text-teal-300 shrink-0" />
                <span>GST Credit Invoices</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Freight & Express Logistics</span>
              </div>
            </div>
          </div>
        </div>

        {/* TARGET INDUSTRIES GRID */}
        <div className="space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Trusted Across Healthcare, Hospitality & Retail
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              NIRA pure oil is specially formulated for rigorous commercial demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Ayurvedic Hospitals</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ideal for Panchakarma, Shirodhara, and medicinal herb infusions. Guaranteed unrefined, sulphur-free purity.
              </p>
              <div className="pt-2 text-[11px] font-bold text-emerald-800 flex items-center">
                <span>5L Jerrycans & 15L Cans</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Organic Retailers</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Attractive retail margins for premium health stores. Available in 200ml, 500ml, 1L glass and 5L home refill packs.
              </p>
              <div className="pt-2 text-[11px] font-bold text-amber-800 flex items-center">
                <span>Distributor Price Tiers</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Restaurants & Catering</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Authentic Malabar coastal aroma with a high smoke point (177°C / 350°F). Zero foaming and long fry life.
              </p>
              <div className="pt-2 text-[11px] font-bold text-orange-800 flex items-center">
                <span>15L Commercial Tins</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Exporters & Re-Packers</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Phytosanitary & export documentation ready for GCC, European, and US food standards with custom palletization.
              </p>
              <div className="pt-2 text-[11px] font-bold text-teal-800 flex items-center">
                <span>Custom Freight Contracts</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ESTIMATOR & QUOTATION FORM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Interactive Volume Estimator & Pricing Matrix */}
          <div className="lg:col-span-5 bg-stone-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-stone-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Interactive Bulk Volume Estimator</h3>
                <p className="text-xs text-stone-400">Select required containers to preview wholesale discounts</p>
              </div>
            </div>

            {/* Container Quantity Sliders / Controls */}
            <div className="space-y-4">
              {/* 15L Tin Can */}
              <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-300 flex items-center">
                    <Package className="w-4 h-4 mr-1.5 text-amber-400" />
                    15 Litre Commercial Tin Can
                  </span>
                  <span className="font-mono text-stone-300 font-bold">{can15LQty} units ({can15LQty * 15} L)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setCan15LQty(Math.max(0, can15LQty - 1))}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={can15LQty}
                    onChange={(e) => setCan15LQty(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setCan15LQty(can15LQty + 1)}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 5L Jerrycan */}
              <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-300 flex items-center">
                    <Package className="w-4 h-4 mr-1.5 text-emerald-400" />
                    5 Litre Food-Grade HDPE Jerrycan
                  </span>
                  <span className="font-mono text-stone-300 font-bold">{can5LQty} units ({can5LQty * 5} L)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setCan5LQty(Math.max(0, can5LQty - 1))}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={can5LQty}
                    onChange={(e) => setCan5LQty(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setCan5LQty(can5LQty + 1)}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 1L Bottle */}
              <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-teal-300 flex items-center">
                    <Package className="w-4 h-4 mr-1.5 text-teal-400" />
                    1 Litre Glass / PET Retail Bottle
                  </span>
                  <span className="font-mono text-stone-300 font-bold">{bottle1LQty} units ({bottle1LQty} L)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setBottle1LQty(Math.max(0, bottle1LQty - 5))}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={bottle1LQty}
                    onChange={(e) => setBottle1LQty(Number(e.target.value))}
                    className="flex-1 accent-teal-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setBottle1LQty(bottle1LQty + 5)}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 500ml Bottle */}
              <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-300 flex items-center">
                    <Package className="w-4 h-4 mr-1.5 text-stone-400" />
                    500 ml Retail Pack
                  </span>
                  <span className="font-mono text-stone-300 font-bold">{bottle500mlQty} units ({bottle500mlQty * 0.5} L)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setBottle500mlQty(Math.max(0, bottle500mlQty - 10))}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={bottle500mlQty}
                    onChange={(e) => setBottle500mlQty(Number(e.target.value))}
                    className="flex-1 accent-stone-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setBottle500mlQty(bottle500mlQty + 10)}
                    className="w-8 h-8 rounded-xl bg-stone-700 text-white font-bold hover:bg-stone-600 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Volume & Price Breakdown Card */}
            <div className="bg-gradient-to-r from-amber-900/40 to-emerald-900/40 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300 uppercase tracking-wider font-bold">Total Batch Volume</span>
                <span className="font-serif text-2xl font-bold text-amber-300">{totalLitres} Litres</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <span className="text-stone-400">Bulk Volume Discount Tier:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                  {bulkDiscountPercent}% Wholesale Savings
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Estimated Rate per Litre:</span>
                <span className="font-mono text-white font-bold">₹{estimatedWholesalePerLitre} / L</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-white/10">
                <span className="text-stone-200">Estimated Order Value:</span>
                <span className="font-serif text-xl text-amber-400">₹{estimatedOrderSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-stone-400 italic">
                *Final quotation may include applicable GST & freight location charges based on delivery city.
              </p>
            </div>
          </div>

          {/* RIGHT: B2B Quotation Form or Submission Confirmation */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl">
            {submittedEnquiry ? (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono text-xs font-bold rounded-full border border-amber-300">
                    Quote Reference: {submittedEnquiry.referenceNumber}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                    Quotation Request Received!
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-1">
                    Thank you, <strong>{submittedEnquiry.contactPerson}</strong>. Our Kozhikode B2B Wholesale Desk will review <strong>{submittedEnquiry.businessName}</strong>'s request and dispatch an official proforma invoice within 2 business hours.
                  </p>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left space-y-2 text-xs">
                  <div className="font-bold text-stone-800 border-b pb-1">Enquiry Summary:</div>
                  <div className="grid grid-cols-2 gap-2 text-stone-600">
                    <div>Business: <strong>{submittedEnquiry.businessName}</strong></div>
                    <div>Category: <strong>{submittedEnquiry.businessType}</strong></div>
                    <div>Location: <strong>{submittedEnquiry.city}, {submittedEnquiry.state}</strong></div>
                    <div>Total Volume: <strong>{submittedEnquiry.totalEstimatedLitres} Litres</strong></div>
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleLaunchWhatsAppQuote}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Connect Instant B2B WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4 text-stone-600" />
                    <span>Print Quotation Slip</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedEnquiry(null)}
                  className="text-xs font-semibold text-stone-500 underline hover:text-stone-800"
                >
                  Submit Another B2B Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 flex items-center">
                    <FileText className="w-6 h-6 text-amber-700 mr-2" />
                    Request Official B2B Wholesale Quote
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Fill in your organization details to receive GST invoice pricing & Certificate of Analysis (CoA).
                  </p>
                </div>

                {/* Business Information Section */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block border-b pb-1">
                    1. Business & Contact Information
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Company / Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Dhanvantari Ayurveda Hospital"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Dr. Anand Menon"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Business Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="procurement@company.com"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Industry / Business Type *
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      >
                        <option value="Ayurvedic Wellness / Hospital">Ayurvedic Wellness / Hospital</option>
                        <option value="Organic Retail Store">Organic Retail Store</option>
                        <option value="Restaurant / Hospitality">Restaurant / Hospitality</option>
                        <option value="Wholesale Exporter">Wholesale Exporter</option>
                        <option value="Other">Other Institutional Buyer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        GSTIN Number (Optional for Tax Credit)
                      </label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="32AAAAA0000A1Z5"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-mono outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Frequency */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block border-b pb-1">
                    2. Location & Order Frequency
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">City / Town *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kozhikode"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Kerala"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="673001"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Delivery Frequency</label>
                      <select
                        value={orderFrequency}
                        onChange={(e) => setOrderFrequency(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      >
                        <option value="One-time Order">One-time Bulk Order</option>
                        <option value="Monthly Subscription">Monthly Auto-Replenishment</option>
                        <option value="Quarterly Contract">Quarterly Contract</option>
                        <option value="Weekly Restock">Weekly Restock</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Estimated Monthly Requirement</label>
                      <select
                        value={estimatedMonthlyReq}
                        onChange={(e) => setEstimatedMonthlyReq(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                      >
                        <option value="50 - 100 Litres/month">50 - 100 Litres / month</option>
                        <option value="100 - 250 Litres/month">100 - 250 Litres / month</option>
                        <option value="250 - 500 Litres/month">250 - 500 Litres / month</option>
                        <option value="500+ Litres/month">500+ Litres / month (Contract Freight)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Specific Quality or Packaging Notes
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g., Require Wood Cold-Pressed Unfiltered copra oil batch with CoA lab certificate, palletized for BlueDart express freight."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:bg-white transition-all"
                  />
                </div>

                {/* Form Submit CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-stone-500 flex items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
                    <span>FSSAI Lic No: 11322007000123 • Kozhikode Extraction Mill</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 bg-amber-900 hover:bg-amber-950 text-white font-serif font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <span>Processing Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Request B2B Quotation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* B2B FAQ / ASSURANCE */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold text-stone-900 text-center">
            Commercial Wholesale Assurance & Mill Direct Commitments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="space-y-1.5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block text-sm">🧪 Guaranteed Quality Certification</span>
              <p>Every bulk dispatch comes with a batch-specific Certificate of Analysis (CoA) confirming FFA &lt; 0.5%, zero mineral oil, zero chemical bleaching, and 100% copra origin.</p>
            </div>
            <div className="space-y-1.5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block text-sm">🧾 GST Tax Credit Invoicing</span>
              <p>We issue tax invoices with full GSTIN details so your accounting team can claim Input Tax Credit (ITC) seamlessly across all Indian states.</p>
            </div>
            <div className="space-y-1.5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block text-sm">🚚 Direct Mill Express Logistics</span>
              <p>Shipped directly from our Kozhikode extraction unit in tamper-evident food-grade HDPE cans and heavy-duty steel-reinforced tins for zero transit leakage.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
