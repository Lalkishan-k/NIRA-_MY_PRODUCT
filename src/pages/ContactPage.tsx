import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

export const ContactPage: React.FC = () => {
  const { settings, addToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitContact({ name, email, phone, subject, message });
      setIsSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      addToast('Thank you! Our Kerala team has received your message.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to send message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent('Hello NIRA team, I would like to make an inquiry.');
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
          Malabar Heritage Hub
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Get in Touch with NIRA
        </h1>
        <p className="text-stone-500 text-sm">
          Have questions about our copra drying process, bulk culinary wholesale, or retail deliveries? We are always here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Card */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 space-y-8 shadow-xl">
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-white">Production & Mill Facility</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Situated in the agricultural heartland of Kozhikode, Kerala. Visited by coconut farmers and quality inspectors daily.
            </p>
          </div>

          <div className="space-y-5 text-xs text-stone-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-sm">Headquarters & Mill</span>
                <p className="text-stone-400 mt-0.5">
                  {settings.address.line1}<br />
                  {settings.address.line2}<br />
                  {settings.address.city}, {settings.address.state} — {settings.address.pincode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-sm">Direct Phone Numbers</span>
                <div className="mt-0.5 space-y-0.5">
                  <a href={`tel:${settings.supportPhone}`} className="hover:text-amber-300 block">
                    {settings.supportPhone} <span className="text-[10px] text-emerald-400 font-normal">(Primary)</span>
                  </a>
                  {settings.secondaryPhone && (
                    <a href={`tel:${settings.secondaryPhone}`} className="hover:text-amber-300 block text-stone-400">
                      {settings.secondaryPhone} <span className="text-[10px] text-stone-400 font-normal">(WhatsApp / Support)</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block text-sm">Customer Support Email</span>
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-amber-300">
                  {settings.supportEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block text-sm">Operating Hours</span>
                <p className="text-stone-400">Monday – Saturday: 8:30 AM – 6:30 PM IST</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800">
            <button
              onClick={openWhatsApp}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Instant Chat on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">Send an Inquiry or Bulk Request</h2>
            <p className="text-xs text-stone-500 mt-1">
              Fill out this quick form and our support desk in Kozhikode will reply within 24 hours.
            </p>
          </div>

          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Your message has been sent successfully! Our team will get back to you shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Menon"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98470 12345"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="">Select a topic...</option>
                  <option value="Product Inquiry">Product Quality & Origin</option>
                  <option value="Bulk Order">Bulk Family Canister / Wholesale Order</option>
                  <option value="Order Tracking">Existing Order Status</option>
                  <option value="Distributorship">Retail / Ayurvedic Clinic Partnership</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Your Message *</label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your questions here..."
                required
                className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 space-y-6">
        <h3 className="font-serif text-2xl font-bold text-stone-900 text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-600">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm">Why does pure coconut oil solidify in colder weather?</h4>
            <p className="leading-relaxed">
              100% unadulterated coconut oil has a natural melting point of 24°C (76°F). Freezing or solidifying into a white solid is the true scientific proof that no liquid mineral oils or adulterants have been mixed. It retains 100% of its qualities.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm">How long does shipping take across India?</h4>
            <p className="leading-relaxed">
              Orders placed before 2:00 PM IST are packed same-day. Courier transit takes 2–3 days for South India and 3–5 days for North/West/East India.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm">What is the difference between Pure Oil and Extra Virgin Oil?</h4>
            <p className="leading-relaxed">
              Pure Coconut Oil is expeller pressed from sun-dried ripe copra (ideal for high-heat cooking, tempering, and hair oil). Extra Virgin Coconut Oil is raw wet-milled from fresh coconut milk using a centrifuge without heat (super light, perfect for baby massage and raw consumption).
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 text-sm">Is NIRA sulphur-free?</h4>
            <p className="leading-relaxed">
              Yes, 100%. Commercial processors often burn toxic sulphur to whiten and preserve copra artificially. NIRA relies entirely on hygienic sun drying and clean hot-air dehydration to guarantee 0% sulphur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
