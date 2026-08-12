"use client";

import { useState } from "react";
import { Star, X, CheckCircle2 } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: { name: string; rating: number; comment: string }) => void;
}

export default function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onSuccess({ name, rating, comment });
      setIsSubmitted(false);
      setName("");
      setComment("");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 border border-black/10 shadow-2xl relative font-satoshi">
        <button onClick={onClose} className="absolute top-5 right-5 text-black/40 hover:text-black cursor-pointer">
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
            <h3 className="text-xl font-bold text-black">Review Submitted!</h3>
            <p className="text-sm text-black/60">Thank you for sharing your feedback with the community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-black font-integral">Write a Review</h3>
              <p className="text-xs text-black/60 mt-1">Share your experience with this product.</p>
            </div>

            {/* Star Picker */}
            <div>
              <label className="block text-xs font-medium text-black/70 mb-2">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer"
                  >
                    <Star
                      size={24}
                      className={
                        (hoverRating || rating) >= star
                          ? "fill-[#FFC633] text-[#FFC633]"
                          : "text-black/20"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 mb-1.5">Your Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Samantha D."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 mb-1.5">Review Message</label>
              <textarea
                required
                rows={3}
                placeholder="How was the fit, material, and quality?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#F0F0F0] rounded-[16px] p-4 text-sm text-black outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white rounded-full py-3.5 text-sm font-medium hover:bg-black/80 transition cursor-pointer"
            >
              Post Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
