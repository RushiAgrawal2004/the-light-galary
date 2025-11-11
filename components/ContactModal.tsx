import React from 'react';
import { X, Mail, Globe } from 'lucide-react';
import { ContactInfo } from '../types.ts';

interface ContactModalProps {
  name: string;
  contactInfo: ContactInfo;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ name, contactInfo, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-brand-background p-8 border border-brand-border w-full max-w-md relative"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-serif font-medium mb-2 text-center">Contact Information</h2>
        <p className="text-center text-brand-secondary mb-6">Contact details for {name}</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Mail className="text-brand-primary" size={20} />
            <a href={`mailto:${contactInfo.email}`} className="text-brand-text hover:underline break-all">
              {contactInfo.email}
            </a>
          </div>
          {contactInfo.website && (
            <div className="flex items-center gap-4">
              <Globe className="text-brand-primary" size={20} />
              <a 
                href={contactInfo.website.startsWith('http') ? contactInfo.website : `//${contactInfo.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brand-text hover:underline break-all"
              >
                {contactInfo.website}
              </a>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full text-center py-2 border border-brand-border hover:bg-gray-100 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ContactModal;