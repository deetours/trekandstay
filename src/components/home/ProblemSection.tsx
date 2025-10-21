import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Smartphone, Briefcase, Heart } from 'lucide-react';

export default function ProblemSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const problems = [
    {
      icon: Smartphone,
      text: "You check your phone 200+ times a day"
    },
    {
      icon: Briefcase, 
      text: "Your last vacation had 47 work emails"
    },
    {
      icon: Heart,
      text: "When asked if you're okay, you lied"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-cloud-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-4xl md:text-5xl font-serif text-deep-forest text-center mb-16"
        >
          You're Not Just Tired. You're Erased.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <Icon className="w-16 h-16 text-sunrise-coral mx-auto mb-6" />
                <p className="text-xl text-mystic-indigo font-medium leading-relaxed">
                  {problem.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}