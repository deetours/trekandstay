import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, UserCheck, CalendarCheck, Wallet, Undo2, Globe, Camera, AlertTriangle, BadgeCheck, Clock, HeartHandshake, ScrollText } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/common/Logo';
import { LocalScene } from '../components/3d/LocalScene';

interface Section { icon: React.ElementType; title: string; content: string[]; }

const sections: Section[] = [
  {
    icon: ScrollText,
    title: 'Acceptance of Terms',
    content: [
      'Booking or participating in any Trek & Stay activity constitutes acceptance of these Terms & Conditions.',
      'Participants must be 18+ or have documented guardian consent for minors 13–17.',
      'We may update terms; continued use implies acceptance of the latest version.'
    ]
  },
  {
    icon: UserCheck,
    title: 'Participant Responsibilities',
    content: [
      'Provide accurate personal, medical & emergency contact information.',
      'Disclose conditions that may affect participation (asthma, surgeries, allergies).',
      'Follow guide instructions, environmental protocols, and safety briefings at all times.'
    ]
  },
  {
    icon: Wallet,
    title: 'Payments & Pricing',
    content: [
      'Prices include listed inclusions only; exclusions & optional add‑ons billed separately.',
      'Full / partial advance required to secure reservation; balance due as communicated.',
      'Pricing may adjust due to fuel, permit, or regulatory changes—participants notified prior to trip.'
    ]
  },
  {
    icon: Undo2,
    title: 'Cancellations & Refunds',
    content: [
      'Participant cancellation must be emailed. Refund % depends on notice period per policy schedule.',
      'No-shows or departure-day cancellations are non‑refundable.',
      'Operator cancellations (weather, safety, minimum group not met) → full refund or reschedule option.'
    ]
  },
  {
    icon: CalendarCheck,
    title: 'Itinerary & Schedule Changes',
    content: [
      'We reserve right to modify itinerary (route, campsite, transport) for safety / operational reasons.',
      'Alternative arrangements offered where feasible without compromising safety.',
      'Delays due to weather, landslides, transport breakdowns not guaranteed for compensation.'
    ]
  },
  {
    icon: ShieldCheck,
    title: 'Risk Acknowledgment',
    content: [
      'Adventure travel involves inherent risks: injury, illness, environmental hazards, force majeure.',
      'Participants acknowledge informed consent to these risks and agree to mitigation instructions.',
      'We maintain emergency protocols but outcomes can’t be guaranteed.'
    ]
  },
  {
    icon: Globe,
    title: 'Environmental & Ethical Conduct',
    content: [
      'Zero tolerance for littering, wildlife harassment, cultural site vandalism.',
      'Leave No Trace practices mandatory; biodegradable products encouraged.',
      'Local community respect expected: language, customs, property.'
    ]
  },
  {
    icon: Camera,
    title: 'Media & Content',
    content: [
      'We may capture photos/video during trips for promotional use unless participant opts out in writing.',
      'Participants retain rights to personal media but grant Trek & Stay permission to repost with credit.',
      'Drone usage subject to local regulations & prior approval.'
    ]
  },
  {
    icon: BadgeCheck,
    title: 'Permissions & Compliance',
    content: [
      'All necessary permits/licenses are obtained where required for the itinerary.',
      'Participants must carry valid ID; foreign nationals must comply with visa & entry regulations.',
      'Non-compliance may result in removal without refund.'
    ]
  },
  {
    icon: AlertTriangle,
    title: 'Disciplinary Actions',
    content: [
      'Unsafe behavior, harassment, intoxication, or willful non-compliance may result in exclusion.',
      'Threatening or discriminatory conduct is grounds for immediate termination without refund.',
      'Group safety overrides individual continuation.'
    ]
  },
  {
    icon: Clock,
    title: 'Limitation of Liability',
    content: [
      'Our liability limited to amount paid for the specific trip portion affected.',
      'We are not liable for indirect losses: personal equipment, consequential financial loss, delay costs.',
      'Participants advised to secure appropriate travel / health / cancellation insurance.'
    ]
  },
  {
    icon: HeartHandshake,
    title: 'Force Majeure',
    content: [
      'Events beyond control (natural disasters, epidemics, political unrest) may alter or cancel services.',
      'In such events, refunds processed net of irreversible third‑party costs where applicable.'
    ]
  }
];

export const TermsPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-gray pt-24 pb-20 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 opacity-30">
          <LocalScene variant="globe" size={260} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-16" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
            <Logo size="lg" showText={false} />
            <h1 className="text-4xl lg:text-6xl font-oswald font-bold text-forest-green mt-6 mb-4">Terms & Conditions</h1>
            <p className="text-xl text-mountain-blue font-inter max-w-4xl mx-auto leading-relaxed">Please review these terms carefully—they form the legal foundation of your adventure with Trek & Stay.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {sections.map((sec, idx) => { const Icon = sec.icon; return (
                <motion.div key={sec.title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay: idx * 0.05 }}>
                  <Card className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-adventure-orange/10 rounded-xl p-3 mr-3"><Icon className="w-7 h-7 text-adventure-orange" /></div>
                      <h2 className="text-xl font-oswald font-bold text-forest-green">{sec.title}</h2>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
                      {sec.content.map(item => (
                        <li key={item} className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-adventure-orange before:rounded-full">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ); })}
            </div>
            <div className="space-y-6">
              <Card className="p-6 sticky top-28">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-adventure-orange mr-2" />
                  <h3 className="text-lg font-oswald font-bold text-forest-green">Summary Snapshot</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>Transparent pricing, defined inclusions</li>
                  <li>Risk awareness & responsible conduct required</li>
                  <li>Refunds depend on notice & cause</li>
                  <li>Safety & ethics override itinerary certainty</li>
                </ul>
                <div className="bg-adventure-orange/10 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  Participation implies consent to operational adaptations necessary for group safety and environmental stewardship.
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-oswald font-bold text-forest-green mb-3">Questions?</h3>
                <p className="text-sm text-gray-600 mb-4">Need clarification on any clause? Reach out—clarity before commitment is our policy.</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Email: <span className="font-medium">support@trekandstay.com</span></p>
                  <p>Emergency: <span className="font-medium">+91-8000-123-456</span></p>
                  <p>Office Hours: 9:00–18:00 IST (Mon–Sat)</p>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-oswald font-bold text-forest-green mb-3">Version Control</h3>
                <p className="text-sm text-gray-600">Current Version Date: {new Date().toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">Earlier versions available upon request. Material changes communicated via email / dashboard notifications.</p>
              </Card>
            </div>
          </div>

          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.3 }} className="mt-16 text-center text-gray-500 text-xs">
            By continuing you confirm you have read & understood these terms.
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TermsPage;
