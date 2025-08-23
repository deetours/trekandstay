import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, HeartPulse, MapPin, Clock, Users, Compass, LifeBuoy, Mountain, Thermometer, Sun } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/common/Logo';
import { LocalScene } from '../components/3d/LocalScene';

const sections = [
  {
    icon: Shield,
    title: 'Our Safety Philosophy',
    points: [
      'Safety is integrated into planning, execution and feedback loops for every trip',
      'All guides are vetted, trained and certified for wilderness first-aid & emergency response',
      'Gear inspections before each departure; redundancy for mission‑critical equipment',
      'Real-time weather & route condition monitoring with dynamic risk adjustments'
    ]
  },
  {
    icon: Activity,
    title: 'Pre‑Trip Requirements',
    points: [
      'Mandatory health & fitness disclosure form',
      'Medical conditions & medications reviewed confidentially',
      'Gear checklist shared 5–7 days prior; rental assistance available',
      'Pre‑departure briefing (virtual / on‑site) covering route, risks, contingencies'
    ]
  },
  {
    icon: Thermometer,
    title: 'Environmental Awareness',
    points: [
      'Continuous assessment of heat, humidity, altitude & hydration status',
      'Heat illness, hypothermia & altitude warning signs taught to participants',
      'Scheduled hydration & nutrition breaks enforced by guides'
    ]
  },
  {
    icon: LifeBuoy,
    title: 'Emergency Preparedness',
    points: [
      'Every trek carries a medical kit matched to group size & terrain risk',
      'Satellite / network communication escalation tree',
      'Evacuation protocols rehearsed quarterly',
      'Local hospital / rescue contacts cached offline'
    ]
  },
  {
    icon: Shield,
    title: 'Medical & First Aid',
    points: [
      'Lead guide certified in Wilderness First Aid / CPR',
      'Secondary responder assigned on trips > 12 participants',
      'Allergies & conditions flagged discretely on guide manifest',
      'Incident logs maintained and reviewed post‑trip'
    ]
  },
  {
    icon: Compass,
    title: 'Route & Terrain Management',
    points: [
      'Scouted GPX tracks with seasonal alternates',
      'Dynamic pacing adjusted to weakest participant (no one left isolated)',
      'Weather abort thresholds defined (rain intensity, lightning proximity, river level)',
      'Turn‑around time established to ensure safe daylight return'
    ]
  },
  {
    icon: Mountain,
    title: 'Participant Responsibility',
    points: [
      'Adhere to guide instructions & environmental protocols',
      'Self-report early symptoms: dizziness, nausea, cramping, extremity numbness',
      'Carry mandatory personal gear (footwear, water, insulation, lighting)',
      'No alcohol / intoxicants 24h before and during trek'
    ]
  },
  {
    icon: Sun,
    title: 'Sustainability & Ethics',
    points: [
      'Strict Leave No Trace: pack out all waste including organics',
      'No wildlife feeding / harassment; maintain observation distance',
      'Use of biodegradable soaps only in designated wash zones',
      'Local community respect: cultural sites, noise discipline, purchase locally'
    ]
  }
];

const quickTips = [
  { icon: Clock, text: 'Arrive 20–30 min early for briefing' },
  { icon: Users, text: 'Stay within visual contact of group' },
  { icon: MapPin, text: 'Do not leave marked trail sections' },
  { icon: HeartPulse, text: 'Report discomfort immediately' }
];

export const SafetyPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-gray pt-24 pb-20 relative overflow-hidden">
        <div className="absolute -top-24 -right-10 opacity-40">
          <LocalScene variant="globe" size={300} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-16" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
            <Logo size="lg" showText={false} />
            <h1 className="text-4xl lg:text-6xl font-oswald font-bold text-forest-green mt-6 mb-4">Safety Guidelines</h1>
            <p className="text-xl text-mountain-blue font-inter max-w-3xl mx-auto leading-relaxed">A culture of prevention, preparedness and responsible adventure for every participant.</p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16" initial="hidden" animate="visible" variants={{ visible:{ transition:{ staggerChildren:0.05 } } }}>
            {sections.map((sec)=>{ const Icon = sec.icon; return (
              <motion.div key={sec.title} variants={{ hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0 } }} whileHover={{ y:-6 }}>
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="bg-adventure-orange/10 rounded-xl p-3 mr-3"><Icon className="w-7 h-7 text-adventure-orange" /></div>
                    <h3 className="text-lg font-oswald font-bold text-forest-green">{sec.title}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 leading-relaxed flex-1">
                    {sec.points.map(p=> <li key={p} className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-adventure-orange before:rounded-full">{p}</li> )}
                  </ul>
                </Card>
              </motion.div>
            );})}
          </motion.div>

          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }} className="bg-gradient-to-r from-forest-green to-mountain-blue rounded-3xl p-10 text-white mb-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-oswald font-bold mb-4 flex items-center"><Shield className="w-8 h-8 mr-3" /> What You Can Expect</h2>
                <p className="text-lg leading-relaxed opacity-90 mb-4">Every Trek & Stay departure is structured around layered safety: proactive risk assessment, continuous monitoring, and decisive intervention when thresholds are met.</p>
                <p className="text-lg leading-relaxed opacity-90">We believe informed participants are safer participants. Transparency builds trust—and better adventure outcomes.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {quickTips.map(t=>{ const Icon = t.icon; return (
                  <div key={t.text} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-adventure-orange" />
                    <span className="text-sm font-medium leading-snug">{t.text}</span>
                  </div>
                );})}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.3 }} className="mb-8 text-center text-gray-500 text-sm">
            Last Updated: {new Date().toLocaleDateString()}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SafetyPage;
