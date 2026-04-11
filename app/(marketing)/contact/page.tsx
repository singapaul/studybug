'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, Check, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock: contact form submission
      console.log('Contact form submitted:', formData);
      setIsSuccess(true);
      toast("Message sent! We'll get back to you within 1-2 business days.");
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Something went wrong. Failed to send your message. Please try again or email us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-cream">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-[5%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-20 right-[10%] w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-1/2 right-[20%] w-24 h-24 rounded-full bg-coral/10 blur-xl" />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Get in <span className="text-secondary">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Questions? We&apos;re here to help. Send us a message and we&apos;ll respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8">
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-8 h-8 text-success" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Thanks for reaching out!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      We&apos;ll get back to you within 1-2 business days. Check your inbox for a
                      confirmation email.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                      variant="outline"
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => updateField('subject', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Enquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="school">School Enquiry</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help?"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => updateField('message', e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-white hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="mailto:hello@studybug.io"
                      className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-foreground">Email</div>
                        <div>hello@studybug.io</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+442012345678"
                      className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-foreground">Phone</div>
                        <div>+44 20 1234 5678</div>
                      </div>
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">Location</div>
                      <div>Flintshire, UK</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Support Hours</h3>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Mon - Fri</div>
                    <div>9am - 5pm GMT</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
