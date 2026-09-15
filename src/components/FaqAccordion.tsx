import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, Droplets } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'Production Methods' | 'Shelf Life' | 'Shipping & Delivery' | 'Quality & Purity';
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Production Methods',
    question: 'How is NIRA Pure Coconut Oil extracted?',
    answer: 'NIRA coconut oil is crafted using traditional wooden cold-pressed (Mara Chekku) extraction methods. We use sun-dried mature copra from organic Kerala coconut groves and extract the oil at low temperatures without any external heat, chemical solvents, or bleaching agents, preserving all natural antioxidants, nutrients, and the signature aroma.'
  },
  {
    category: 'Production Methods',
    question: 'Why is your oil unfiltered?',
    answer: 'Unlike commercial refined oils that undergo high-heat refining, deodorization, and chemical filtration stripping away natural goodness, NIRA is 100% unfiltered and unrefined. This retains the rich natural bioactive compounds, vitamin E, and medium-chain fatty acids (MCTs) exactly as nature intended.'
  },
  {
    category: 'Shelf Life',
    question: 'What is the shelf life of NIRA Coconut Oil, and how should it be stored?',
    answer: 'Our pure coconut oil has a natural shelf life of 24 months from the date of extraction. Store it in a cool, dry place away from direct sunlight. No refrigeration is required. Coconut oil naturally solidifies below 24°C (75°F); you can gently warm the bottle in warm water to liquefy it if desired.'
  },
  {
    category: 'Shelf Life',
    question: 'Does pure coconut oil expire or go rancid easily?',
    answer: 'Because pure cold-pressed coconut oil is rich in natural saturated medium-chain fatty acids and antioxidants, it is exceptionally stable and resistant to oxidation compared to seed oils. As long as moisture is kept out of the bottle, it remains fresh for years.'
  },
  {
    category: 'Shipping & Delivery',
    question: 'How long does shipping take, and where do you deliver?',
    answer: 'We ship across India from our processing unit in Kerala. Standard delivery typically takes 3 to 6 business days depending on your location. Express delivery options are available at checkout. All bottles are securely packed in eco-friendly bubble-wrap and heavy-duty cartons to prevent transit damage.'
  },
  {
    category: 'Shipping & Delivery',
    question: 'What are your shipping charges and is free delivery available?',
    answer: 'We offer FREE standard shipping across India on all prepaid and COD orders above ₹499. For orders below ₹499, a nominal shipping fee of ₹50 applies.'
  },
  {
    category: 'Quality & Purity',
    question: 'Is NIRA certified by FSSAI and organic authorities?',
    answer: 'Yes! NIRA operates under strict FSSAI central licensing standards. Every batch undergoes rigorous quality testing for moisture content, free fatty acids (FFA), and 100% purity without any mineral oil or adulterant blending.'
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Production Methods', 'Shelf Life', 'Shipping & Delivery', 'Quality & Purity'];

  const filteredFaqs = activeCategory === 'All'
    ? FAQ_DATA
    : FAQ_DATA.filter(faq => faq.category === activeCategory);

  return (
    <section className="py-16 bg-stone-50/80 border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 font-semibold px-3 py-1 rounded-full text-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Everything You Want to Know About NIRA
          </h2>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">
            Got questions about our traditional Kerala extraction methods, shelf life, or delivery? We have answers.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-white border-emerald-800/30 shadow-md ring-1 ring-emerald-800/10'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      Q
                    </span>
                    <span className="font-serif font-bold text-sm sm:text-base text-stone-900">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-stone-100 text-stone-600 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-emerald-800 text-white' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4 animate-fade-in">
                    <div className="pl-10 space-y-2">
                      <p>{faq.answer}</p>
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider bg-stone-100 text-stone-500 px-2 py-0.5 rounded">
                        Category: {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
