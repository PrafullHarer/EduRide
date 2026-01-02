import { Link, useLocation } from "react-router-dom";
import { Bus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="bg-black/90 backdrop-blur-md border border-white/10 text-white rounded-full shadow-2xl px-6 py-3 flex items-center justify-between gap-8 max-w-5xl w-full">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bus className="w-4 h-4 text-black" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight">EduRide</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                                isActive(link.path)
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <Link to="/login">
                        <Button className="rounded-full bg-primary text-black hover:bg-primary/90 font-semibold px-6">
                            Sign In
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggle />
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full mt-2 left-4 right-4 bg-black/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 md:hidden shadow-2xl animate-fade-in origin-top">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "p-4 rounded-xl text-center font-medium border border-white/5 transition-colors",
                                isActive(link.path) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full rounded-xl bg-primary text-black hover:bg-primary/90 font-bold py-6">
                            Sign In to Portal
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Navbar;
