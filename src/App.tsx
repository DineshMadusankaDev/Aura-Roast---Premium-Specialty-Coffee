/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useParams, 
  useNavigate,
  useLocation 
} from 'react-router-dom';
import { 
  Coffee, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Globe, 
  Clock, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Play,
  Search,
  Heart,
  ChevronLeft,
  Instagram,
  Twitter,
  Facebook,
  Share2,
  Mail,
  Eye
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  region: string;
  process: string;
  notes: string[];
  roastLevel: 'Light' | 'Medium' | 'Dark';
  price: number;
  subPrice: number;
  image: string;
  images: string[];
  intensity: number;
  story: string;
  roastProfile: string;
  brewRecommendation: string;
}

interface CartItem {
  bean: CoffeeBean;
  quantity: number;
  isSubscription: boolean;
}

interface Review {
  id: string;
  beanId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

// --- Mock Data ---
const COFFEE_BEANS: CoffeeBean[] = [
  {
    id: '1',
    name: 'Ethiopia Yirgacheffe',
    origin: 'Ethiopia',
    region: 'Gedeo Zone',
    process: 'Washed',
    notes: ['Jasmine', 'Lemon', 'Bergamot'],
    roastLevel: 'Light',
    price: 24.00,
    subPrice: 19.20,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800'
    ],
    intensity: 3,
    story: 'Sourced from the high-altitude Gedeo Zone, this Yirgacheffe represents the pinnacle of Ethiopian coffee. The unique microclimate and volcanic soil impart a distinct floral character that has made this region world-famous.',
    roastProfile: 'Lightly roasted to preserve the delicate volatile aromatics. We use a fast-roast profile with a short development time to highlight the bright citric acidity and tea-like body.',
    brewRecommendation: 'Best enjoyed as a V60 pour-over. Use a 1:16 ratio with 92°C water to unlock the complex jasmine and bergamot notes.'
  },
  {
    id: '2',
    name: 'Colombia Huila',
    origin: 'Colombia',
    region: 'Huila',
    process: 'Honey',
    notes: ['Caramel', 'Red Apple', 'Chocolate'],
    roastLevel: 'Medium',
    price: 22.00,
    subPrice: 17.60,
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800'
    ],
    intensity: 5,
    story: 'Our Huila selection comes from a small cooperative of 15 farmers. The honey process leaves some of the mucilage on the bean during drying, resulting in a cup with exceptional sweetness and a syrupy mouthfeel.',
    roastProfile: 'A medium roast that balances the natural fruit sugars with a developing chocolate base. We aim for a "City+" roast level to maximize the caramelization.',
    brewRecommendation: 'Excellent for AeroPress or a balanced drip coffee. A 1:15 ratio brings out the rich apple and caramel sweetness.'
  },
  {
    id: '3',
    name: 'Sumatra Mandheling',
    origin: 'Indonesia',
    region: 'Sumatra',
    process: 'Wet-Hulled',
    notes: ['Earth', 'Spice', 'Dark Chocolate'],
    roastLevel: 'Dark',
    price: 26.00,
    subPrice: 20.80,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800'
    ],
    intensity: 8,
    story: 'Mandheling coffee is grown on the volcanic slopes of Mount Leuser. The traditional "Giling Basah" (wet-hulling) process is unique to Indonesia, giving the coffee its signature low acidity and heavy, earthy body.',
    roastProfile: 'Roasted deep into the second crack to develop those classic spicy and smoky notes. This profile emphasizes body and dark chocolate bitterness over acidity.',
    brewRecommendation: 'Perfect for French Press or Espresso. The heavy body stands up beautifully to milk, making it an ideal base for lattes.'
  }
];

// --- Components ---

const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  wishlistCount, 
  onOpenWishlist,
  cartCount,
  onOpenCart
}: { 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  wishlistCount: number,
  onOpenWishlist: () => void,
  cartCount: number,
  onOpenCart: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    } else {
      setIsMenuOpen(false);
      // Let the default link behavior (href="/#id") handle it
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "bg-charcoal/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Coffee className="w-8 h-8 text-gold" />
          <span className="text-2xl font-serif tracking-tighter text-white">AURA ROAST</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-widest uppercase">
          <a href="/#shop" onClick={(e) => handleNavClick(e, 'shop')} className="hover:text-gold transition-colors">Shop</a>
          <a href="/#roastery" onClick={(e) => handleNavClick(e, 'roastery')} className="hover:text-gold transition-colors">The Roastery</a>
          <a href="/#brew" onClick={(e) => handleNavClick(e, 'brew')} className="hover:text-gold transition-colors">Brew Guide</a>
          <a href="/#quiz" onClick={(e) => handleNavClick(e, 'quiz')} className="hover:text-gold transition-colors">Flavor Finder</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Search beans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-full px-4 py-1 text-sm focus:outline-none focus:border-gold w-full ml-2"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={onOpenWishlist}
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
          >
            <Heart className={cn("w-5 h-5", wishlistCount > 0 ? "text-gold fill-gold" : "")} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-gold text-charcoal text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={onOpenCart}
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-gold text-charcoal text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-charcoal border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            <a href="/#shop" onClick={(e) => handleNavClick(e, 'shop')} className="text-lg font-serif">Shop</a>
            <a href="/#roastery" onClick={(e) => handleNavClick(e, 'roastery')} className="text-lg font-serif">The Roastery</a>
            <a href="/#brew" onClick={(e) => handleNavClick(e, 'brew')} className="text-lg font-serif">Brew Guide</a>
            <a href="/#quiz" onClick={(e) => handleNavClick(e, 'quiz')} className="text-lg font-serif">Flavor Finder</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1920" 
          alt="Coffee Roasting" 
          className="w-full h-full object-cover brightness-[0.3]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/50 to-charcoal" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-gold font-medium tracking-[0.3em] uppercase text-sm mb-4 block">
            Specialty Roastery & Laboratory
          </span>
          <h1 className="text-6xl md:text-8xl font-serif leading-[0.9] mb-8 tracking-tighter">
            ELEVATE YOUR <br />
            <span className="italic text-gold-gradient">SENSORY</span> RITUAL
          </h1>
          <p className="text-lg md:text-xl text-cream/70 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Crafting rare origins for the discerning palate. Experience the intersection of heritage roasting and modern precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 gold-gradient text-charcoal font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 group">
              Shop The Collection
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border border-white/20 hover:bg-white/5 rounded-full transition-colors flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              Watch The Process
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent mx-auto" />
      </motion.div>
    </section>
  );
};

const ProductCard: React.FC<{ 
  bean: CoffeeBean, 
  isWishlisted: boolean, 
  onToggleWishlist: () => void,
  onAddToCart: (isSub: boolean) => void,
  onQuickView: () => void
}> = ({ bean, isWishlisted, onToggleWishlist, onAddToCart, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${bean.id}`)}
      className="glass-card overflow-hidden group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <motion.img 
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6 }}
          src={bean.image} 
          alt={bean.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-charcoal/80 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest font-bold border border-white/10">
            {bean.roastLevel} Roast
          </span>
          {bean.intensity > 7 && (
            <span className="px-3 py-1 bg-gold text-charcoal rounded-full text-[10px] uppercase tracking-widest font-bold">
              High Intensity
            </span>
          )}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className="absolute top-4 right-4 p-2 bg-charcoal/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all z-20"
        >
          <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "text-gold fill-gold" : "text-white")} />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-charcoal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            className="w-full py-3 border border-white/20 bg-charcoal/40 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            Quick View
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(false);
            }}
            className="w-full py-3 bg-white text-charcoal font-bold rounded-xl hover:bg-gold transition-colors flex items-center justify-center gap-2"
          >
            Quick Add
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-serif mb-1">{bean.name}</h3>
            <p className="text-xs text-cream/50 uppercase tracking-widest">{bean.region}, {bean.origin}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-serif text-gold">${bean.price.toFixed(2)}</p>
            <p className="text-[10px] text-cream/40 line-through">${(bean.price * 1.2).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {bean.notes.map(note => (
            <span key={note} className="text-[10px] px-2 py-1 border border-white/10 rounded-md text-cream/60">
              {note}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(true);
            }}
            className="flex items-center gap-1 group/sub"
          >
            <Zap className="w-3 h-3 text-gold group-hover/sub:scale-125 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-gold group-hover/sub:underline">Subscribe & Save 20%</span>
          </button>
          <p className="text-sm font-bold text-white">${bean.subPrice.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FlavorFinder = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = [
    {
      q: "How do you prefer your morning ritual?",
      options: ["Bright & Energetic", "Smooth & Balanced", "Bold & Intense"]
    },
    {
      q: "Which flavor profile resonates with you?",
      options: ["Citrus & Floral", "Nutty & Chocolatey", "Earthly & Spicy"]
    },
    {
      q: "What's your preferred brewing method?",
      options: ["Pour Over / V60", "Espresso", "French Press / Cold Brew"]
    }
  ];

  const handleAnswer = (option: string) => {
    setAnswers([...answers, option]);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length);
    }
  };

  return (
    <section id="quiz" className="py-24 px-6 bg-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">FLAVOR FINDER</h2>
          <p className="text-cream/60 max-w-xl mx-auto">Answer 3 questions to discover your perfect origin match.</p>
        </div>

        <div className="glass-card p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step < questions.length ? (
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-serif text-gold">0{step + 1}</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-xs uppercase tracking-widest text-cream/40">Step {step + 1} of 3</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif">{questions[step].q}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {questions[step].options.map(option => (
                    <button 
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="p-6 border border-white/10 rounded-2xl hover:border-gold hover:bg-gold/5 transition-all text-left group"
                    >
                      <span className="text-lg font-medium block mb-2">{option}</span>
                      <ArrowRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-gold" />
                </div>
                <h3 className="text-3xl font-serif mb-4">Your Match: Ethiopia Yirgacheffe</h3>
                <p className="text-cream/60 mb-8 max-w-md mx-auto">Based on your preference for bright, floral notes and V60 brewing, this light roast will elevate your morning ritual.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-8 py-4 gold-gradient text-charcoal font-bold rounded-full">Add to Cart</button>
                  <button onClick={() => setStep(0)} className="px-8 py-4 border border-white/10 rounded-full">Retake Quiz</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
    </section>
  );
};

const RoasteryStory = () => {
  return (
    <section id="roastery" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden relative z-10">
            <img 
              src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&q=80&w=800" 
              alt="Roasting Machine" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 glass-card p-8 z-20 hidden md:block">
            <h4 className="text-4xl font-serif text-gold mb-2">15+</h4>
            <p className="text-xs uppercase tracking-widest text-cream/60">Years of Roasting Heritage</p>
          </div>
          <div className="absolute -top-10 -left-10 w-48 h-48 border border-gold/20 rounded-full animate-pulse" />
        </div>

        <div>
          <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">The Roastery Philosophy</span>
          <h2 className="text-5xl font-serif mb-8 leading-tight">WHERE SCIENCE MEETS <span className="italic">SOUL</span></h2>
          <p className="text-lg text-cream/70 font-light mb-8 leading-relaxed">
            Our roastery is a laboratory of flavor. We source only the top 1% of specialty beans, tracing every lot back to the individual farmer. Our roasting profiles are developed through hundreds of cupping sessions to unlock the unique DNA of every origin.
          </p>
          
          <div className="space-y-6">
            {[
              { icon: Globe, title: "Ethical Sourcing", desc: "Direct trade relationships with farmers in 12 countries." },
              { icon: Clock, title: "Small Batch Roasting", desc: "Roasted daily in 12kg batches for peak freshness." },
              { icon: CheckCircle2, title: "Quality Control", desc: "Every batch is cupped and verified by our Q-Graders." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h5 className="text-lg font-serif mb-1">{item.title}</h5>
                  <p className="text-sm text-cream/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-black py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Coffee className="w-8 h-8 text-gold" />
            <span className="text-2xl font-serif tracking-tighter text-white">AURA ROAST</span>
          </div>
          <p className="text-cream/50 max-w-sm mb-8 leading-relaxed">
            Elevating the coffee experience through meticulous sourcing and artisanal roasting. Join our journey into the heart of flavor.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-all">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h5 className="text-sm uppercase tracking-[0.2em] font-bold mb-6 text-gold">Explore</h5>
          <ul className="space-y-4 text-cream/60 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">All Collections</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Subscription Plans</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Wholesale Partners</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Brewing Equipment</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm uppercase tracking-[0.2em] font-bold mb-6 text-gold">Support</h5>
          <ul className="space-y-4 text-cream/60 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-cream/30">
        <p>© 2026 Aura Roast Specialty Coffee. All Rights Reserved.</p>
        <div className="flex gap-8">
          <span>Designed for the Discerning</span>
          <span>International Standards</span>
        </div>
      </div>
    </footer>
  );
};

const WishlistDrawer = ({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  onRemove 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  wishlistItems: CoffeeBean[],
  onRemove: (id: string) => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-charcoal border-l border-white/10 z-[70] p-8 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-serif">YOUR WISHLIST</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            {wishlistItems.length > 0 ? (
              <div className="space-y-8">
                {wishlistItems.map(item => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="text-lg font-serif mb-1">{item.name}</h4>
                        <p className="text-xs text-cream/40 uppercase tracking-widest">{item.origin}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gold font-serif">${item.price.toFixed(2)}</p>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-[10px] uppercase tracking-widest font-bold text-cream/30 hover:text-gold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-4 gold-gradient text-charcoal font-bold rounded-full mt-8">
                  Add All to Cart
                </button>
              </div>
            ) : (
              <div className="text-center py-20">
                <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-cream/40 font-serif text-xl">Your wishlist is empty</p>
                <button 
                  onClick={onClose}
                  className="mt-6 text-gold hover:underline uppercase tracking-widest text-xs font-bold"
                >
                  Discover Origins
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProductDetail = ({ 
  onToggleWishlist, 
  isWishlisted,
  onAddToCart,
  reviews,
  onAddReview
}: { 
  onToggleWishlist: (id: string) => void, 
  isWishlisted: (id: string) => boolean,
  onAddToCart: (bean: CoffeeBean, isSub: boolean) => void,
  reviews: Review[],
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bean = COFFEE_BEANS.find(b => b.id === id);
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  if (!bean) return <div className="pt-32 text-center">Bean not found</div>;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const currentUrl = window.location.href;
  const shareText = `Check out this rare ${bean.name} coffee from Aura Roast!`;

  const shareOptions = [
    { 
      name: 'Twitter', 
      icon: Twitter, 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}` 
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}` 
    },
    { 
      name: 'Email', 
      icon: Mail, 
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`I thought you might like this: ${currentUrl}`)}` 
    }
  ];

  const beanReviews = reviews.filter(r => r.beanId === bean.id);
  const averageRating = beanReviews.length > 0 
    ? beanReviews.reduce((acc, r) => acc + r.rating, 0) / beanReviews.length 
    : 0;

  const relatedBeans = COFFEE_BEANS
    .filter(b => b.id !== bean.id)
    .map(b => {
      let score = 0;
      if (b.origin === bean.origin) score += 3;
      if (b.roastLevel === bean.roastLevel) score += 2;
      const sharedNotes = b.notes.filter(note => bean.notes.includes(note));
      score += sharedNotes.length;
      return { bean: b, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.bean);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) return;
    onAddReview({
      beanId: bean.id,
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment
    });
    setNewReview({ userName: '', rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 px-6 max-w-7xl mx-auto"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-cream/60 hover:text-gold transition-colors mb-12 uppercase tracking-widest text-xs font-bold"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        <div className="flex flex-col gap-6">
          <div 
            className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card cursor-zoom-in"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <motion.img 
              key={activeImageIndex}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                scale: isZooming ? 2 : 1,
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              }}
              transition={{ 
                opacity: { duration: 0.3 },
                scale: { duration: 0.2 },
                transformOrigin: { duration: 0 }
              }}
              src={bean.images[activeImageIndex]} 
              alt={bean.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
              <button 
                onClick={() => onToggleWishlist(bean.id)}
                className="p-4 bg-charcoal/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all"
              >
                <Heart className={cn("w-6 h-6", isWishlisted(bean.id) ? "text-gold fill-gold" : "text-white")} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  className="p-4 bg-charcoal/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all"
                >
                  <Share2 className="w-6 h-6 text-white" />
                </button>
                <AnimatePresence>
                  {isShareMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 10 }}
                      className="absolute right-full mr-4 top-0 glass-card p-2 flex flex-col gap-1 min-w-[140px] z-50"
                    >
                      {shareOptions.map(option => (
                        <a 
                          key={option.name}
                          href={option.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest text-cream/80 hover:text-gold"
                          onClick={() => setIsShareMenuOpen(false)}
                        >
                          <option.icon className="w-4 h-4" />
                          {option.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {bean.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={cn(
                  "w-24 h-24 rounded-xl overflow-hidden border-2 transition-all",
                  activeImageIndex === index ? "border-gold" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                <img 
                  src={img} 
                  alt={`${bean.name} view ${index + 1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">
            {bean.origin} • {bean.process} Process
          </span>
          <h1 className="text-5xl md:text-7xl font-serif mb-6">{bean.name}</h1>
          
          <div className="flex items-center gap-8 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-4 h-4", 
                      i < Math.round(averageRating) ? "text-gold fill-gold" : "text-white/10"
                    )} 
                  />
                ))}
              </div>
              <span className="text-xs text-cream/40 uppercase tracking-widest">
                {beanReviews.length} Reviews
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8 mb-10">
            <div>
              <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">Price</p>
              <p className="text-3xl font-serif text-gold">${bean.price.toFixed(2)}</p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div>
              <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">Roast</p>
              <p className="text-xl font-serif">{bean.roastLevel}</p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div>
              <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">Intensity</p>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1 h-4 rounded-full",
                      i < bean.intensity ? "bg-gold" : "bg-white/10"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10 mb-12">
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-4 text-gold">Tasting Notes</h3>
              <div className="flex flex-wrap gap-3">
                {bean.notes.map(note => (
                  <span key={note} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-cream/80">
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-4 text-gold">Origin Story</h3>
              <p className="text-cream/70 leading-relaxed">{bean.story}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-4 text-gold">Roast Profile</h3>
                <p className="text-sm text-cream/60 leading-relaxed">{bean.roastProfile}</p>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-4 text-gold">Brew Guide</h3>
                <p className="text-sm text-cream/60 leading-relaxed">{bean.brewRecommendation}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onAddToCart(bean, false)}
              className="flex-1 py-5 gold-gradient text-charcoal font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Add to Cart
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onAddToCart(bean, true)}
              className="flex-1 py-5 border border-white/10 hover:bg-white/5 rounded-full font-bold transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-gold" />
              Subscribe & Save 20%
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-24 border-t border-white/10 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">Sensory Feedback</span>
            <h2 className="text-4xl font-serif">CUSTOMER REVIEWS</h2>
          </div>
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-charcoal transition-all rounded-full text-sm font-bold uppercase tracking-widest"
          >
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <form onSubmit={handleSubmitReview} className="glass-card p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-cream/40 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={newReview.userName}
                      onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                      placeholder="e.g. Alexander V."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-cream/40 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="p-1"
                        >
                          <Star className={cn("w-6 h-6", star <= newReview.rating ? "text-gold fill-gold" : "text-white/10")} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-cream/40 mb-2">Your Thoughts</label>
                  <textarea 
                    required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors min-h-[120px]"
                    placeholder="Share your experience with this origin..."
                  />
                </div>
                <button type="submit" className="px-10 py-4 gold-gradient text-charcoal font-bold rounded-full hover:scale-105 transition-transform">
                  Submit Review
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {beanReviews.length > 0 ? (
            beanReviews.map(review => (
              <div key={review.id} className="glass-card p-8 border-l-4 border-l-gold">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-serif mb-1">{review.userName}</h4>
                    <p className="text-[10px] text-cream/30 uppercase tracking-widest">{review.date}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-3 h-3", 
                          i < review.rating ? "text-gold fill-gold" : "text-white/10"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-cream/70 leading-relaxed italic">"{review.comment}"</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl">
              <p className="text-cream/40 font-serif text-xl">No reviews yet. Be the first to share your ritual.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="pt-24 border-t border-white/10">
        <div className="mb-12">
          <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">You Might Also Enjoy</span>
          <h2 className="text-4xl font-serif">RELATED ORIGINS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedBeans.map(relatedBean => (
            <ProductCard 
              key={relatedBean.id} 
              bean={relatedBean} 
              isWishlisted={isWishlisted(relatedBean.id)}
              onToggleWishlist={() => onToggleWishlist(relatedBean.id)}
              onAddToCart={(isSub) => onAddToCart(relatedBean, isSub)}
              onQuickView={() => {}} // No quick view in related products for simplicity or can be added
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const QuickViewModal = ({ 
  bean, 
  isOpen, 
  onClose, 
  onAddToCart 
}: { 
  bean: CoffeeBean | null, 
  isOpen: boolean, 
  onClose: () => void,
  onAddToCart: (bean: CoffeeBean, isSub: boolean) => void
}) => {
  if (!bean) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl glass-card p-8 z-[70] overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img 
                  src={bean.image} 
                  alt={bean.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-gold font-medium tracking-[0.3em] uppercase text-[10px] mb-2 block">
                  {bean.origin} • {bean.process}
                </span>
                <h2 className="text-4xl font-serif mb-4">{bean.name}</h2>
                <p className="text-2xl font-serif text-gold mb-6">${bean.price.toFixed(2)}</p>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-cream/40 mb-2">Tasting Notes</h4>
                    <div className="flex flex-wrap gap-2">
                      {bean.notes.map(note => (
                        <span key={note} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-cream/80">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-cream/60 leading-relaxed line-clamp-3">{bean.story}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      onAddToCart(bean, false);
                      onClose();
                    }}
                    className="w-full py-4 gold-gradient text-charcoal font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    Add to Cart
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                  <Link 
                    to={`/product/${bean.id}`}
                    onClick={onClose}
                    className="w-full py-4 border border-white/10 hover:bg-white/5 rounded-full text-center font-bold text-sm transition-all"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const HomePage = ({ 
  filteredBeans, 
  wishlist, 
  toggleWishlist, 
  searchQuery, 
  setSearchQuery,
  onAddToCart,
  sortBy,
  onSortChange
}: { 
  filteredBeans: CoffeeBean[], 
  wishlist: string[], 
  toggleWishlist: (id: string) => void,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  onAddToCart: (bean: CoffeeBean, isSub: boolean) => void,
  sortBy: string,
  onSortChange: (val: any) => void
}) => {
  const [quickViewBean, setQuickViewBean] = useState<CoffeeBean | null>(null);

  return (
    <>
      <Hero />
      
      <section id="shop" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs mb-4 block">Curated Selection</span>
            <h2 className="text-5xl font-serif">THE COLLECTION</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex gap-4">
              <button className="px-6 py-2 border-b-2 border-gold text-white text-sm font-bold uppercase tracking-widest">Single Origin</button>
              <button className="px-6 py-2 border-b-2 border-transparent text-cream/40 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">Blends</button>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-cream/40">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent border-none text-gold text-xs font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-white transition-colors"
              >
                <option value="name" className="bg-charcoal">Name (A-Z)</option>
                <option value="price-low" className="bg-charcoal">Price: Low to High</option>
                <option value="price-high" className="bg-charcoal">Price: High to Low</option>
                <option value="intensity" className="bg-charcoal">Highest Intensity</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBeans.length > 0 ? (
            filteredBeans.map(bean => (
              <ProductCard 
                key={bean.id} 
                bean={bean} 
                isWishlisted={wishlist.includes(bean.id)}
                onToggleWishlist={() => toggleWishlist(bean.id)}
                onAddToCart={(isSub) => onAddToCart(bean, isSub)}
                onQuickView={() => setQuickViewBean(bean)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-2xl font-serif text-cream/40">No beans found matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-gold hover:underline uppercase tracking-widest text-xs font-bold"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-16 text-center">
          <button className="px-10 py-5 border border-white/10 rounded-full hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-[0.2em]">
            View All Origins
          </button>
        </div>
      </section>

      <QuickViewModal 
        bean={quickViewBean}
        isOpen={!!quickViewBean}
        onClose={() => setQuickViewBean(null)}
        onAddToCart={onAddToCart}
      />

      <FlavorFinder />
      
      <RoasteryStory />

      <section className="py-24 px-6 bg-gold text-charcoal">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-5xl font-serif mb-6 leading-tight">JOIN THE ROASTERY CIRCLE</h2>
            <p className="text-lg font-medium opacity-80 leading-relaxed">
              Subscribe to receive rare micro-lots delivered to your door. Save 20% on every order and gain exclusive access to limited releases.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex bg-white/20 backdrop-blur-md rounded-full p-2 border border-black/10">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border-none focus:ring-0 px-6 py-3 w-full md:w-64 placeholder:text-charcoal/50 text-charcoal font-bold"
              />
              <button className="bg-charcoal text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-center opacity-60">
              No commitment. Cancel anytime.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity,
  onRemove 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cartItems: CartItem[],
  onUpdateQuantity: (beanId: string, isSub: boolean, delta: number) => void,
  onRemove: (beanId: string, isSub: boolean) => void
}) => {
  const total = cartItems.reduce((acc, item) => 
    acc + (item.isSubscription ? item.bean.subPrice : item.bean.price) * item.quantity, 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-charcoal border-l border-white/10 z-[70] p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-serif">YOUR CART</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
              {cartItems.length > 0 ? (
                cartItems.map((item, idx) => (
                  <div key={`${item.bean.id}-${item.isSubscription}`} className="flex gap-6 group">
                    <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0 relative">
                      <img src={item.bean.image} alt={item.bean.name} className="w-full h-full object-cover" />
                      {item.isSubscription && (
                        <div className="absolute top-1 right-1 bg-gold p-1 rounded-full">
                          <Zap className="w-3 h-3 text-charcoal" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-serif mb-1">{item.bean.name}</h4>
                          <button 
                            onClick={() => onRemove(item.bean.id, item.isSubscription)}
                            className="text-cream/20 hover:text-gold transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-cream/40 uppercase tracking-widest">
                          {item.isSubscription ? 'Monthly Subscription' : 'One-time Purchase'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1 border border-white/10">
                          <button 
                            onClick={() => onUpdateQuantity(item.bean.id, item.isSubscription, -1)}
                            className="w-6 h-6 flex items-center justify-center hover:text-gold"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.bean.id, item.isSubscription, 1)}
                            className="w-6 h-6 flex items-center justify-center hover:text-gold"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-gold font-serif">
                          ${((item.isSubscription ? item.bean.subPrice : item.bean.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-cream/40 font-serif text-xl">Your cart is empty</p>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="pt-8 border-t border-white/10 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-cream/60 uppercase tracking-widest text-xs font-bold">Estimated Total</span>
                  <span className="text-3xl font-serif text-gold">${total.toFixed(2)}</span>
                </div>
                <button className="w-full py-5 gold-gradient text-charcoal font-bold rounded-full hover:scale-[1.02] transition-transform">
                  Proceed to Checkout
                </button>
                <p className="text-[10px] text-center text-cream/30 mt-4 uppercase tracking-widest">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'r1',
      beanId: '1',
      userName: 'Julian M.',
      rating: 5,
      comment: 'The jasmine notes are incredibly clear. Best Yirgacheffe I\'ve had this year.',
      date: 'March 15, 2026'
    },
    {
      id: 'r2',
      beanId: '2',
      userName: 'Sarah L.',
      rating: 4,
      comment: 'Beautiful caramel sweetness. Perfect for my morning AeroPress.',
      date: 'March 10, 2026'
    }
  ]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'intensity'>('name');

  const toggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const addToCart = (bean: CoffeeBean, isSubscription: boolean) => {
    setCart(prev => {
      const existing = prev.find(item => item.bean.id === bean.id && item.isSubscription === isSubscription);
      if (existing) {
        return prev.map(item => 
          (item.bean.id === bean.id && item.isSubscription === isSubscription)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { bean, quantity: 1, isSubscription }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (beanId: string, isSubscription: boolean, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.bean.id === beanId && item.isSubscription === isSubscription) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (beanId: string, isSubscription: boolean) => {
    setCart(prev => prev.filter(item => !(item.bean.id === beanId && item.isSubscription === isSubscription)));
  };

  const addReview = (review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const wishlistItems = COFFEE_BEANS.filter(bean => wishlist.includes(bean.id));

  const filteredAndSortedBeans = COFFEE_BEANS
    .filter(bean => 
      bean.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bean.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bean.notes.some(note => note.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'intensity') return b.intensity - a.intensity;
      return a.name.localeCompare(b.name);
    });

  return (
    <Router>
      <div className="min-h-screen selection:bg-gold selection:text-charcoal">
        <Navbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          wishlistCount={wishlist.length}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
        />

        <WishlistDrawer 
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistItems={wishlistItems}
          onRemove={toggleWishlist}
        />

        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
        />
        
        <main>
          <Routes>
            <Route path="/" element={
              <HomePage 
                filteredBeans={filteredAndSortedBeans}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAddToCart={addToCart}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            } />
            <Route path="/product/:id" element={
              <ProductDetail 
                onToggleWishlist={toggleWishlist}
                isWishlisted={(id) => wishlist.includes(id)}
                onAddToCart={addToCart}
                reviews={reviews}
                onAddReview={addReview}
              />
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
