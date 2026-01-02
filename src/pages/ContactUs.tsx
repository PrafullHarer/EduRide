import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";

const ContactUs = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Message sent! We'll get back to you soon.");
    };

    return (
        <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div>
                                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                                    Get in <span className="text-primary">Touch</span>
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Have questions about EduRide? We're here to help schools, parents, and partners.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { icon: Mail, title: "Email Us", content: "support@eduride.com", link: "mailto:support@eduride.com" },
                                    { icon: Phone, title: "Call Us", content: "+91 98765 43210", link: "tel:+919876543210" },
                                    { icon: MapPin, title: "Visit Us", content: "123 Tech Park, Innovation Way, Pune, India", link: "#" }
                                ].map((item, i) => (
                                    <a href={item.link} key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:bg-muted/50 group">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-lg font-semibold mb-1">{item.title}</h3>
                                            <p className="text-muted-foreground">{item.content}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-10 shadow-xl">
                            <h2 className="font-display text-2xl font-bold mb-6">Send us a message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" placeholder="John Doe" className="h-12 bg-background/50" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="john@example.com" className="h-12 bg-background/50" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="How can we help?" className="h-12 bg-background/50" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Tell us more about your inquiry..." className="min-h-[150px] bg-background/50 resize-none" required />
                                </div>
                                <Button size="lg" className="w-full h-12 gradient-primary text-lg font-semibold shadow-glow">
                                    Send Message <Send className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactUs;
