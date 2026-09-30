import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface StaticPageProps {
  type:
    | 'about'
    | 'contact'
    | 'privacy'
    | 'terms'
    | 'return'
    | 'warranty'
    | 'shipping'
    | 'faq';
  onNavigate: (path: string) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  const { success } = useToast();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      success('Thank you! Your inquiry has been dispatched to Saturn Tech BD customer support.');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
    }, 600);
  };

  const faqData = [
    {
      q: 'Are all laptops and computer components 100% original with official warranty?',
      a: 'Yes, absolutely. Saturn Tech BD does not deal in grey-market, refurbished, or clone products unless explicitly marked as refurbished with warranty. Every laptop and PC component comes with authorized distributor serial tracking and official manufacturer warranty in Bangladesh.',
    },
    {
      q: 'How fast is delivery inside Chattogram vs outside Chattogram?',
      a: 'Orders placed inside Chattogram city before 3:00 PM are delivered same-day or within 24 hours (standard charge ৳70). Delivery outside Chattogram to any of the 64 districts in Bangladesh typically takes 24 to 48 hours via insured courier (standard charge ৳130). Orders above ৳50,000 enjoy free nationwide shipping.',
    },
    {
      q: 'Can I pay using Cash on Delivery (COD)?',
      a: 'Yes! We support Cash on Delivery nationwide across Bangladesh. You can inspect the exterior package and pay upon receiving the shipment. We also support all digital payments through our secure SSLCOMMERZ gateway (bKash, Nagad, Rocket, Cards).',
    },
    {
      q: 'Do you offer custom PC build assembly and stress testing?',
      a: 'Yes! We provide complimentary professional assembly, thermal paste application, neat cable management, BIOS updates, and 24-hour benchmark stress-testing for all full custom PC configurations purchased through Saturn Tech BD.',
    },
    {
      q: 'How do I claim official warranty for a defective component?',
      a: 'You can bring the defective product along with the Saturn Tech BD purchase invoice directly to our showroom in Computer City Centre, GEC Circle, Chattogram, or dispatch it via courier to our warranty department. We will diagnose and coordinate with the authorized brand service center on your behalf.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* 1. ABOUT US */}
      {type === 'about' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Who We Are
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              About Saturn Tech BD
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Bangladesh's trusted destination for genuine computer hardware, gaming rigs & professional laptops
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Founded with the vision to make authentic computing technology accessible and reliably backed in Bangladesh, <strong>Saturn Tech BD</strong> operates from the heart of Chattogram's premier technology commercial hub at <strong>Computer City Centre, GEC Circle</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5 text-center">
                <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Official Distribution</h4>
                <p className="text-[11px] text-slate-500">100% genuine products directly from authorized brands.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5 text-center">
                <Truck className="w-6 h-6 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Express Logistics</h4>
                <p className="text-[11px] text-slate-500">Fast delivery across Chattogram and all 64 districts.</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5 text-center">
                <RotateCcw className="w-6 h-6 text-purple-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Certified Service</h4>
                <p className="text-[11px] text-slate-500">In-house hardware diagnostic technicians and warranty support.</p>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900">Our Showroom & Service Hub</h3>
            <p>
              Visit our physical store to experience the latest gaming laptops, test mechanical keyboard switches, and consult directly with our enthusiast hardware builders.
            </p>
            <p>
              <strong>Address:</strong> Shop #402, 4th Floor, Computer City Centre, GEC Circle, Chattogram, Bangladesh.<br />
              <strong>Hotline:</strong> +880 1812-345678 | <strong>Email:</strong> info@saturntechbd.com
            </p>
          </div>
        </div>
      )}

      {/* 2. CONTACT US */}
      {type === 'contact' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Get In Touch
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contact Saturn Tech BD
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Have questions regarding products, bulk quotations, or order assistance?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Store Information */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Chattogram Showroom</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Visit our physical store for in-person consultations, demonstrations, and collections.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Physical Address:</span>
                    <p className="text-slate-600 mt-0.5">
                      Shop #402, 4th Floor, Computer City Centre, GEC Circle, Chattogram, Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Phone Hotlines:</span>
                    <p className="text-slate-600 mt-0.5">+880 1812-345678, +880 1888-999000</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Email Inquiries:</span>
                    <p className="text-slate-600 mt-0.5">support@saturntechbd.com, sales@saturntechbd.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Operating Hours:</span>
                    <p className="text-slate-600 mt-0.5">Saturday – Thursday: 10:00 AM – 9:00 PM</p>
                    <p className="text-slate-600">Friday: 2:30 PM – 9:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                <span className="font-bold text-blue-900 block">Facebook Official Page:</span>
                <a
                  href="https://www.facebook.com/saturntechbd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold mt-1 inline-block"
                >
                  facebook.com/saturntechbd
                </a>
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Send an Inquiry</h3>
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Tanvir Chowdhury"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Message / Quotation Request *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about the laptop model or PC specifications you are inquiring about..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isSending ? 'Sending Inquiry...' : 'Submit Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. WARRANTY POLICY */}
      {type === 'warranty' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Official Coverage
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Warranty & Service Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Guaranteed authorized brand warranty support for every product sold at Saturn Tech BD
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">1. Official Manufacturer Warranty</h3>
            <p>
              All laptops, graphics cards, processors, motherboards, monitors, RAM, and SSDs sold by Saturn Tech BD carry official manufacturer warranties provided by authorized brand distributors in Bangladesh (e.g. ASUS Bangladesh, Acer Bangladesh, Lenovo, HP, Intel, MSI, Gigabyte, Samsung).
            </p>

            <h3 className="text-base font-bold text-slate-900">2. Warranty Durations</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Laptops:</strong> 1 to 2 Years Official Brand International Warranty (refer to product specification).</li>
              <li><strong>Desktop Processors:</strong> 3 Years Official Replacement Warranty.</li>
              <li><strong>Graphics Cards:</strong> 2 to 3 Years Official Brand Warranty.</li>
              <li><strong>Monitors:</strong> 3 Years Official Manufacturer Panel & Parts Warranty.</li>
              <li><strong>SSDs & Memory:</strong> 3 to 5 Years / Lifetime Warranty (as indicated).</li>
            </ul>

            <h3 className="text-base font-bold text-slate-900">3. How to Make a Claim</h3>
            <p>
              Present your original Saturn Tech BD serialized purchase invoice. You may drop off the component at our Computer City Centre showroom in Chattogram, or dispatch it to our Service Department via courier. Typical warranty processing requires 7 to 21 working days according to manufacturer service center turnaround.
            </p>
          </div>
        </div>
      )}

      {/* 4. SHIPPING POLICY */}
      {type === 'shipping' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Fast Logistics
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shipping & Delivery Information
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Delivery rates, estimated turnaround times, and door-to-door courier tracking
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <span className="font-bold text-blue-900 text-sm">Inside Chattogram</span>
                <p className="text-slate-700">Delivery Charge: <strong>৳70</strong></p>
                <p className="text-slate-600 text-xs">Estimated Time: <strong>12 to 24 Hours</strong></p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 text-sm">Outside Chattogram (Nationwide)</span>
                <p className="text-slate-700">Delivery Charge: <strong>৳130</strong></p>
                <p className="text-slate-600 text-xs">Estimated Time: <strong>24 to 48 Hours</strong></p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              ⚡ <strong>Free Delivery Promotion:</strong> All single orders with subtotal above <strong>৳50,000</strong> qualify for 100% Free Express Nationwide Delivery.
            </div>

            <h3 className="text-base font-bold text-slate-900">Packaging Safety</h3>
            <p>
              Every sensitive electronics shipment (monitors, tempered-glass PC cases, processors, and graphics cards) is triple-wrapped in impact-resistant bubble packaging and sealed with Saturn Tech BD security tape to ensure zero transit damage.
            </p>
          </div>
        </div>
      )}

      {/* 5. RETURN POLICY */}
      {type === 'return' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Customer Protection
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Return & Replacement Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Transparent 48-hour return terms for defective or damaged items on arrival
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">1. Dead on Arrival (DOA) Claims</h3>
            <p>
              If a product purchased from Saturn Tech BD exhibits physical courier damage or factory hardware failure upon delivery, you must inform our hotline (+880 1812-345678) within <strong>48 hours</strong> of receipt.
            </p>

            <h3 className="text-base font-bold text-slate-900">2. Conditions for Replacement</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Product must be in its original packaging with all included accessories, manual booklets, and warranty slips.</li>
              <li>Serial numbers and barcode stickers must remain intact and untampered.</li>
              <li>Upon diagnostic inspection by our technical verification team, an immediate replacement or full refund will be processed within 3 to 5 business days.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 6. FAQ PAGE */}
      {type === 'faq' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Help Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about purchasing, warranty, and deliveries at Saturn Tech BD
            </p>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TERMS & PRIVACY */}
      {(type === 'terms' || type === 'privacy') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {type === 'terms' ? 'Terms & Conditions' : 'Privacy & Security Policy'}
          </h1>
          <p className="text-slate-500 text-xs">Last updated: January 2026</p>

          <p>
            Welcome to <strong>Saturn Tech BD</strong>. By accessing our website, placing an order, or interacting with our services, you agree to comply with and be bound by the governing laws of Bangladesh.
          </p>

          <h3 className="text-sm font-bold text-slate-900">Payment Security</h3>
          <p>
            All online financial transactions are handled via SSLCOMMERZ with bank-grade 128-bit encryption. Saturn Tech BD does not store or process debit/credit card CVV or PIN numbers directly.
          </p>

          <h3 className="text-sm font-bold text-slate-900">Data Protection</h3>
          <p>
            Customer contact information, shipping addresses, and phone numbers are strictly used for order fulfillment, dispatch updates, and warranty verification. We never sell or distribute customer data to third-party marketing entities.
          </p>
        </div>
      )}
    </div>
  );
};
