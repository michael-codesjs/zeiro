import Link from 'next/link';
import { 
  ArrowLeft,
  ArrowRight,
  Location,
  Clock,
  People,
  Flash as Lightning,
  Heart,
  Global as Globe,
  Home2,
  DollarCircle,
  Health,
  Book1,
  Calendar1,
  Monitor
} from 'iconsax-react';

export default function CareersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} color="currentColor" variant="Outline" />
              <span>Back to home</span>
            </Link>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Join us in building the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
              future of data
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            We're a team of passionate builders creating tools that make data analysis 
            accessible to everyone. Come help us democratize data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary-hover transition-colors font-semibold">
              View open positions
            </button>
            <Link href="#culture" className="text-muted-foreground hover:text-foreground transition-colors px-8 py-4 inline-flex items-center gap-2">
              Learn about our culture
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="culture" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our values</h2>
            <p className="text-xl text-muted-foreground">What drives us every day</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 border border-blue-600/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Lightning size={32} color="#60a5fa" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Move Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                We ship quickly and iterate based on feedback. Speed is a feature.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 border border-green-600/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <People size={32} color="#4ade80" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">User First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every decision starts with understanding our users' needs and pain points.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 border border-purple-600/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Heart size={32} color="#c084fc" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Care Deeply</h3>
              <p className="text-muted-foreground leading-relaxed">
                We're passionate about our craft and care about the details that matter.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600/20 border border-orange-600/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Globe size={32} color="#fb923c" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Think Global</h3>
              <p className="text-muted-foreground leading-relaxed">
                We build for a global audience and embrace diverse perspectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why work with us</h2>
            <p className="text-xl text-muted-foreground">We invest in our team's growth and wellbeing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Home2 size={20} color="#60a5fa" variant="Outline" />
                <h3 className="text-lg font-semibold text-foreground">Remote-first culture</h3>
              </div>
              <p className="text-muted-foreground">Work from anywhere with flexible hours and async communication.</p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarCircle size={20} color="#4ade80" variant="Outline" />
                <h3 className="text-lg font-semibold text-foreground">Competitive compensation</h3>
              </div>
              <p className="text-muted-foreground">Market-rate salaries plus equity in a fast-growing company.</p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Health size={20} color="#c084fc" variant="Outline" />
                <h3 className="text-lg font-semibold text-foreground">Health & wellness</h3>
              </div>
              <p className="text-muted-foreground">Comprehensive health insurance and wellness stipends.</p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Book1 size={20} color="#fb923c" variant="Outline" />
                <h3 className="text-lg font-semibold text-foreground">Learning budget</h3>
              </div>
              <p className="text-muted-foreground">Annual budget for courses, conferences, and skill development.</p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar1 size={20} color="#22d3ee" variant="Outline" />
                <h3 className="text-lg font-semibold text-foreground">Unlimited PTO</h3>
              </div>
              <p className="text-muted-foreground">Take the time you need to recharge and maintain work-life balance.</p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Monitor size={20} color="#f59e0b" variant="Outline" />
                <h3 className="text-lg font-semibold text-foreground">Top-tier equipment</h3>
              </div>
              <p className="text-muted-foreground">Latest MacBooks, monitors, and any tools you need to do your best work.</p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to join us?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            We're always looking for talented people who share our passion for making data accessible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-flex items-center gap-2">
              View open positions
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </button>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors px-8 py-4">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
