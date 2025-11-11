
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full mt-24 border-t border-brand-border">
      <div className="container mx-auto px-6 py-8 text-center text-brand-secondary text-sm">
        <p>&copy; {currentYear} The Gallery of Light. A quiet space for art and individuality.</p>
      </div>
    </footer>
  );
};

export default Footer;
