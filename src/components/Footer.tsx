const Footer = () => {
  return (
    <footer className="py-12 bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Logo and branding */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo.webp" alt="EERA OS Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold">EERA OS</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              by Acharya Ventures
            </p>

            <div className="text-sm text-muted-foreground text-center space-y-1">
              <p>© 2025 Acharya Ventures. All rights reserved.</p>
              <p className="italic">Crafted in Rishikesh. Built for the world. 🌏</p>
            </div>
          </div>

          {/* Optional links section */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="mailto:hello@eera.app" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
