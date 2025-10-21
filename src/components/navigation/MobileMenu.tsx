import { Fragment } from 'react';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mountain } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    name: 'Retreats',
    children: [
      { name: 'Signature Retreats', href: '/retreats/signature' },
      { name: 'Partner Experiences', href: '/retreats/partner' },
      { name: 'Premium Packages', href: '/retreats/premium' },
      { name: 'All Retreats', href: '/trips' }
    ]
  },
  {
    name: 'Destinations',
    children: [
      { name: 'Karnataka', href: '/destinations/karnataka' },
      { name: 'Himachal Pradesh', href: '/destinations/himachal' },
      { name: 'Upcoming Destinations', href: '/destinations/upcoming' }
    ]
  },
  {
    name: 'Transformations',
    children: [
      { name: 'Digital Detox', href: '/transformations/digital-detox' },
      { name: 'Nature Therapy', href: '/transformations/nature-therapy' },
      { name: 'Spiritual Awakening', href: '/transformations/spiritual' },
      { name: 'Relationship Healing', href: '/transformations/relationships' }
    ]
  }
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col overflow-y-scroll bg-cloud-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-soft-grey">
                      <Link to="/" className="flex items-center gap-3" onClick={onClose}>
                        <Mountain className="w-8 h-8 text-sunrise-coral" />
                        <div className="flex flex-col">
                          <span className="font-serif text-xl font-bold text-deep-forest">
                            Transformation
                          </span>
                          <span className="font-sans text-xs uppercase tracking-wider text-mystic-indigo">
                            Travel
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={onClose}
                        className="p-2 text-deep-forest hover:bg-warm-sand rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 px-6 py-6">
                      <div className="space-y-4">
                        {menuItems.map((item) => (
                          <Disclosure key={item.name}>
                            {({ open }) => (
                              <>
                                <Disclosure.Button className="flex w-full items-center justify-between py-3 text-left font-medium text-deep-forest hover:text-sunrise-coral transition-colors">
                                  {item.name}
                                  <ChevronDownIcon
                                    className={`w-5 h-5 transition-transform ${
                                      open ? 'rotate-180' : ''
                                    }`}
                                  />
                                </Disclosure.Button>
                                <Transition
                                  enter="transition duration-100 ease-out"
                                  enterFrom="transform scale-95 opacity-0"
                                  enterTo="transform scale-100 opacity-100"
                                  leave="transition duration-75 ease-out"
                                  leaveFrom="transform scale-100 opacity-100"
                                  leaveTo="transform scale-95 opacity-0"
                                >
                                  <Disclosure.Panel className="pl-4 pb-2">
                                    <div className="space-y-2">
                                      {item.children.map((child) => (
                                        <Link
                                          key={child.name}
                                          to={child.href}
                                          onClick={onClose}
                                          className="block py-2 text-mystic-indigo hover:text-sunrise-coral transition-colors"
                                        >
                                          {child.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </Disclosure.Panel>
                                </Transition>
                              </>
                            )}
                          </Disclosure>
                        ))}

                        {/* Direct Links */}
                        <div className="space-y-2 pt-4 border-t border-soft-grey">
                          <Link
                            to="/about"
                            onClick={onClose}
                            className="block py-3 font-medium text-deep-forest hover:text-sunrise-coral transition-colors"
                          >
                            About
                          </Link>
                          <Link
                            to="/blog"
                            onClick={onClose}
                            className="block py-3 font-medium text-deep-forest hover:text-sunrise-coral transition-colors"
                          >
                            Journal
                          </Link>
                          <Link
                            to="/contact"
                            onClick={onClose}
                            className="block py-3 font-medium text-deep-forest hover:text-sunrise-coral transition-colors"
                          >
                            Contact
                          </Link>
                          <Link
                            to="/b2b"
                            onClick={onClose}
                            className="block py-3 font-medium text-deep-forest hover:text-sunrise-coral transition-colors"
                          >
                            Partner Portal
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* CTA Section */}
                    <div className="p-6 border-t border-soft-grey">
                      <Link to="/quiz" onClick={onClose}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-sunrise-coral text-cloud-white py-3 rounded-lg font-bold hover:bg-deep-forest transition-colors"
                        >
                          Find My Perfect Retreat
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}