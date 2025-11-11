import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, interactive = false, onRatingChange, size = 16 }) => {
  
  const handleStarClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const starColor = interactive ? "text-amber-400" : "text-amber-500";

  return (
    <div className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = rating >= starValue;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleStarClick(index)}
            className={`transition-transform duration-200 ${interactive ? 'hover:scale-125' : ''}`}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={`${isFilled ? starColor : 'text-brand-border'} transition-colors`}
              fill={isFilled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
