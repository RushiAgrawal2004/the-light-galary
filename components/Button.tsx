import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

// FIX: To resolve the type error, the component is refactored to be polymorphic.
// This allows it to correctly accept props for either a <button> or a react-router-dom <Link>.
// By creating a discriminated union type, TypeScript can infer the correct props to use.

// 1. Define base props shared by both variants.
interface BaseProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'large';
  icon?: React.ReactNode;
}

// 2. Define props for when the component is a <button>.
//    It extends standard button attributes and explicitly states `to` is not allowed.
// FIX: Removed `to?: never` which was confusing TypeScript's discriminated union inference.
type AsButton = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

// 3. Define props for when the component is a <Link>.
//    It extends `react-router-dom`'s `LinkProps`.
type AsLink = BaseProps & Omit<LinkProps, keyof BaseProps>;

// 4. Create a union type. This allows the component to accept either `AsButton` or `AsLink` props.
type ButtonProps = AsButton | AsLink;

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'normal', icon, ...props }) => {
  // FIX: Removed padding from baseClasses to be handled by the new size prop.
  const baseClasses = "inline-flex items-center justify-center font-semibold tracking-wide transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary";
  
  const styles = {
    primary: "bg-brand-primary text-brand-background hover:bg-brand-primary-hover",
    secondary: "bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-brand-background"
  };

  // FIX: Added styles for different button sizes. 'normal' matches the original style to avoid visual changes.
  const sizeStyles = {
    normal: "px-8 py-3",
    large: "px-10 py-4 text-lg",
  };

  const combinedClasses = `${baseClasses} ${styles[variant]} ${sizeStyles[size]}`;

  const content = (
    <>
      {children}
      {icon && <span className="ml-2">{icon}</span>}
    </>
  );

  // By checking for the `to` prop, TypeScript can correctly infer which type from the union is being used.
  if ('to' in props) {
    // FIX: Pass down props to the Link component.
    return (
      <Link className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  // `props` is now correctly typed as `AsButton` plus the destructured common props.
  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
};

export default Button;