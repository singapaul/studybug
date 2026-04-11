import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Studybug transformed how our students revise. We've seen a 30% improvement in test scores since implementing it school-wide.",
    author: 'Sarah Mitchell',
    role: 'Head of Learning',
    school: 'Oakwood Academy',
  },
  {
    quote:
      'The admin dashboard makes it so easy to track student progress. Our teachers love the pre-built revision decks.',
    author: 'James Chen',
    role: 'ICT Coordinator',
    school: "St. Mary's School",
  },
  {
    quote:
      'Implementation was seamless with SSO. Students were up and running within minutes. Excellent support team.',
    author: 'Emma Thompson',
    role: 'Deputy Head',
    school: 'Riverside College',
  },
];

const schoolLogos = [
  'Oakwood Academy',
  "St. Mary's School",
  'Riverside College',
  'Westminster Academy',
  'Kings College',
  'Brighton High',
];

export function SchoolTestimonials() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by Leading Schools</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See why hundreds of schools choose Studybug for their students
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 rounded-xl bg-card border border-border">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6">&ldquo;{testimonial.quote}&rdquo;</blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.school}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* School Logos */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6">Trusted by schools across the UK</p>
          <div className="flex flex-wrap justify-center gap-8">
            {schoolLogos.map((school, index) => (
              <div
                key={index}
                className="px-6 py-3 rounded-lg bg-muted/50 border border-border text-muted-foreground font-medium"
              >
                {school}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
