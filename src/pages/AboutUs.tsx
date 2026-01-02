import Navbar from "@/components/Navbar";
import { Users, Target, Heart, Award } from "lucide-react";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="container mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-slide-up">
                        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                            Driving the Future of <br />
                            <span className="text-primary">School Transportation</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            EduRide is dedicated to ensuring every student's journey is safe, efficient, and joyful. We bridge the gap between schools, parents, and drivers with cutting-edge technology.
                        </p>
                    </div>

                    {/* Stats/Values Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                        {[
                            { icon: Target, title: "Our Mission", desc: "To eliminate transportation anxiety for parents and schools." },
                            { icon: Heart, title: "Safety First", desc: "We prioritize student safety above all else, in every feature we build." },
                            { icon: Users, title: "Community", desc: "Building stronger connections between schools and families." },
                            { icon: Award, title: "Excellence", desc: "Setting the gold standard for school logistics management." }
                        ].map((item, i) => (
                            <div key={i} className="bg-card border border-border/50 p-8 rounded-3xl hover:border-primary/50 transition-colors group">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Image Section */}
                    <div className="relative rounded-3xl overflow-hidden aspect-video md:aspect-[21/9] mb-24">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                            alt="School Bus"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 text-white max-w-2xl">
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Built with love for the next generation.</h2>
                            <p className="text-white/80">Every line of code we write helps a child get to school safely.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AboutUs;
