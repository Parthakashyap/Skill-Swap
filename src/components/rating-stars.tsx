'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  size?: number;
  isEditable?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function RatingStars({
  rating,
  totalStars = 5,
  size = 16,
  isEditable = false,
  onRatingChange,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = isEditable ? hoverRating || rating : rating;

  const handleStarClick = (starIndex: number) => {
    if (isEditable && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (isEditable) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (isEditable) {
      setHoverRating(0);
    }
  };

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(totalStars)].map((_, i) => {
        const starIndex = i + 1;
        return (
          <Star
            key={starIndex}
            size={size}
            className={cn(
              'transition-colors',
              starIndex <= displayRating
                ? 'text-accent fill-accent'
                : 'text-gray-300 dark:text-gray-600',
              isEditable && 'cursor-pointer'
            )}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
          />
        );
      })}
    </div>
  );
}
