"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, Loader2 } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { fullName: string | null };
}

interface ReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: ReviewItem) => void;
}

export default function ReviewModal({
  productId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment,
          name: name.trim() || "Verified Buyer",
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setIsSubmitted(true);
        setTimeout(() => {
          onSuccess(json.data);
          setIsSubmitted(false);
          setIsSubmitting(false);
          setName("");
          setComment("");
          onClose();
        }, 1000);
      } else {
        alert(json.message || "Failed to submit review");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 border border-black/10 shadow-2xl relative font-satoshi">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-black/40 hover:text-black cursor-pointer"
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
            <h3 className="text-xl font-bold text-black font-integral">Review Submitted!</h3>
            <p className="text-sm text-black/60">
              Thank you for sharing your feedback. Your review is now live!
            </p>
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
                placeholder="e.g. Alex M."
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
              disabled={isSubmitting}
              className="w-full bg-black text-white rounded-full py-3.5 text-sm font-medium hover:bg-black/80 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Review...
                </>
              ) : (
                "Post Review"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
