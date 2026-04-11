'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Calendar, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export function SchoolCTA() {
  return (
    <section className="py-24 bg-foreground relative overflow-hidden">
      <div className="absolute top-10 left-[10%] w-48 h-48 rounded-full bg-primary/20 blur-2xl" />
      <div className="absolute bottom-10 right-[15%] w-64 h-64 rounded-full bg-accent/20 blur-2xl" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-4"
          >
            Ready to Transform Learning at Your School?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-white/80 mb-8 max-w-2xl mx-auto"
          >
            Book a personalized demo to see how Studybug can help your students achieve better
            results. Our education specialists will walk you through everything.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-lg"
              asChild
            >
              <Link href="/schools/demo">
                <Calendar className="w-4 h-4 mr-2" />
                Request a Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full"
              asChild
            >
              <a href="mailto:schools@studybug.com">
                <Mail className="w-4 h-4 mr-2" />
                Contact Sales
              </a>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-sm text-white/70 mt-6"
          >
            No commitment required · Response within 24 hours
          </motion.p>
        </div>
      </div>
    </section>
  );
}
