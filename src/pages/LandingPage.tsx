import { Link } from "react-router-dom";
import { Bus, Shield, Bell, MapPin, Users, Clock, ChevronRight, Leaf, Star, CheckCircle, Smartphone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl animate-pulse-slow opacity-50" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in hover:bg-primary/20 transition-colors cursor-default">
                <Leaf className="w-4 h-4 text-primary animate-bounce" />
                <span className="text-sm font-medium text-primary">#1 Safe & Eco-Friendly Transport</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up leading-[1.1] tracking-tight">
                Safety First, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">Every Journey.</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
                Real-time GPS tracking, instant AI notifications, and complete peace of mind
                for modern parents and school administrators.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/login">
                  <Button size="lg" className="h-14 px-8 text-lg gradient-primary hover:opacity-90 transition-all shadow-glow hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto">
                    Get Started Free
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-primary/20 hover:bg-primary/5 hover:border-primary/50 w-full sm:w-auto">
                  Watch Demo
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-2">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-primary border-b-[6px] border-b-transparent ml-1" />
                  </div>
                </Button>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full" />
                    </div>
                  ))}
                </div>
                <div className="pl-2">
                  <span className="font-bold text-foreground">10k+</span> parents trust us.
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="flex-1 relative animate-float">
              <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                {/* Main Glass Card */}
                <div className="absolute inset-x-8 inset-y-8 bg-card/50 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-20">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                    <div className="absolute bottom-4 left-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                        <Bus className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">School Bus 12</h3>
                        <p className="text-xs text-muted-foreground bg-white/50 backdrop-blur px-2 py-0.5 rounded-full inline-block">On Route</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 relative">
                    {/* Map Mockup */}
                    <div className="w-full h-full rounded-xl bg-muted/50 border border-border/50 relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_0_8px_rgba(var(--primary),0.2)] animate-pulse" />
                      </div>
                      {/* Route Line */}
                      <svg className="absolute inset-0 w-full h-full text-primary/30" stroke="currentColor" strokeWidth="4" fill="none">
                        <path d="M50,200 Q150,100 250,150 T450,100" />
                      </svg>
                    </div>

                    {/* Floating Stats */}
                    <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur shadow-lg rounded-xl p-3 flex flex-col gap-1 animate-bounce" style={{ animationDuration: '3s' }}>
                      <span className="text-xs text-muted-foreground">Est. Arrival</span>
                      <span className="text-sm font-bold text-primary">5 mins</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent rounded-2xl rotate-12 opacity-50 blur-xl animate-pulse-slow" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary rounded-full blur-2xl opacity-40 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Partner Schools" },
              { value: "50k+", label: "Daily Students" },
              { value: "99.99%", label: "Uptime Guarentee" },
              { value: "24/7", label: "Live Support" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="font-display text-4xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need for <br />
              <span className="text-primary">Smarter Transportation</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform handles everything from route planning to billing,
              making school transport safer and more efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Live GPS Tracking",
                description: "Track buses in real-time with precise location updates every 3 seconds. View historical route data instantly.",
                color: "from-blue-500 to-cyan-400",
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description: "Get instant alerts for pick-ups, drop-offs, delays, and emergencies via Push, SMS, and WhatsApp.",
                color: "from-amber-500 to-orange-400",
              },
              {
                icon: Shield,
                title: "Safety First",
                description: "AI-powered driving behavior monitoring, speed alerts, and SOS panic buttons for drivers and students.",
                color: "from-green-500 to-emerald-400",
              },
              {
                icon: Users,
                title: "Easy Attendance",
                description: "Contactless NFC/QR code based attendance. Know exactly who is on the bus at any given moment.",
                color: "from-purple-500 to-pink-400",
              },
              {
                icon: Smartphone,
                title: "Parent Portal",
                description: "A beautiful, easy-to-use dashboard for parents to track their children and pay fees.",
                color: "from-indigo-500 to-blue-500",
              },
              {
                icon: Lock,
                title: "Secure Payments",
                description: "Automated billing and secure payment gateway integration for hassle-free fee collection.",
                color: "from-red-500 to-rose-400",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10 group-hover:text-foreground/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Ready to upgrade your transport?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">Join 500+ schools and ensure the safest journey for your students today.</p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-7 rounded-full shadow-2xl transition-transform hover:scale-105">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
        {/* Background Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Bus className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl">EduRide</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                Making school transportation safe, efficient, and transparent for everyone involved.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Drivers Portal</a></li>
                <li><a href="#" className="hover:text-primary">Parents Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} EduRide. All rights reserved.</p>
              <span className="hidden md:inline mx-2">•</span>
              <p>Developed by <span className="text-foreground font-medium">Prafull Harer</span></p>
            </div>
            <div className="flex gap-4">
              {/* Social Icons would go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
