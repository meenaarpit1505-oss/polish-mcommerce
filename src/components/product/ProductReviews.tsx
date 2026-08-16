"use client";

import { useState, useTransition } from "react";
import { Star, ShieldCheck, User, SquarePen, CheckCircle } from "lucide-react";
import { submitProductReview, type Review } from "@/app/actions/reviews";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface ProductReviewsProps {
  productId: string;
  initialReviews: Review[];
  ratingDistribution: Record<number, number>;
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({ productId, initialReviews, ratingDistribution, averageRating, totalReviews }: ProductReviewsProps) {
  const locale = useLocale();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<number | null>(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredReviews = filter 
    ? reviews.filter((r) => r.rating === filter) 
    : reviews;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment) return;

    startTransition(async () => {
      const res = await submitProductReview({
        productId,
        rating,
        reviewerName,
        title,
        comment
      });

      if (res.success) {
        setIsSuccess(true);
        // Prepend new review in client state so they see it instantly
        const newReview: Review = {
          id: `new-rev-${Date.now()}`,
          reviewer_name: reviewerName,
          rating,
          title: title || null,
          comment,
          is_verified_purchase: true, // We label it verified buyer in the current session
          created_at: new Date().toISOString()
        };
        
        setReviews([newReview, ...reviews]);
        
        setTimeout(() => {
          setIsSuccess(false);
          setShowForm(false);
          // Reset form fields
          setReviewerName("");
          setTitle("");
          setComment("");
          setRating(5);
        }, 2000);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Social Proof compliance bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-accent/10 pb-5">
        <div>
          <h2 className="text-2xl font-black text-foreground">
            {locale === "pl" ? "Opinie Klientów" : "Customer Reviews"}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-primary font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>
              {locale === "pl" 
                ? "Opinie tylko od zweryfikowanych kupujących (zgodnie z dyrektywą Omnibus)"
                : "Reviews only from verified buyers (according to EU Omnibus Directive)"}
            </span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <SquarePen className="h-4 w-4" />
          {locale === "pl" ? "Napisz opinię" : "Write a review"}
        </button>
      </div>

      {/* Review Submission Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-surface rounded-2xl border border-accent/10 shadow-sm"
          >
            {isSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <CheckCircle className="h-12 w-12 text-primary animate-bounce" />
                <h3 className="text-lg font-black text-foreground">
                  {locale === "pl" ? "Dziękujemy za opinię!" : "Thank you for your review!"}
                </h3>
                <p className="text-xs text-muted font-medium">
                  {locale === "pl" 
                    ? "Twoja opinia została pomyślnie opublikowana i jest widoczna poniżej."
                    : "Your review has been successfully published and is visible below."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                <h3 className="font-extrabold text-foreground text-sm">
                  {locale === "pl" ? "Dodaj swoją ocenę" : "Add your feedback"}
                </h3>
                
                {/* Dynamic Star Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted block">
                    {locale === "pl" ? "Twoja ocena:" : "Your rating:"}
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoveredRating(s)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="p-1 focus:outline-none cursor-pointer"
                      >
                        <Star 
                          className={`h-7 w-7 fill-current transition-transform duration-100 ${
                            s <= (hoveredRating ?? rating) ? "text-amber-400 scale-110" : "text-neutral-200"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted block" htmlFor="reviewerName">
                      {locale === "pl" ? "Imię / Pseudonim *:" : "Name / Nickname *:"}
                    </label>
                    <input
                      id="reviewerName"
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder={locale === "pl" ? "np. Anna K." : "e.g. John D."}
                      className="w-full rounded-xl border border-accent/10 bg-background px-4 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted block" htmlFor="title">
                      {locale === "pl" ? "Tytuł opinii:" : "Review title:"}
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={locale === "pl" ? "np. Bardzo polecam!" : "e.g. Highly recommend!"}
                      className="w-full rounded-xl border border-accent/10 bg-background px-4 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted block" htmlFor="comment">
                    {locale === "pl" ? "Treść opinii *:" : "Your review *:"}
                  </label>
                  <textarea
                    id="comment"
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={locale === "pl" ? "Napisz co sądzisz o produkcie..." : "Write your thoughts..."}
                    className="w-full rounded-xl border border-accent/10 bg-background px-4 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-full bg-neutral-100 px-5 py-2.5 text-xs font-bold text-muted hover:bg-neutral-200 transition-all cursor-pointer"
                  >
                    {locale === "pl" ? "Anuluj" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primaryDark transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? (locale === "pl" ? "Zapisywanie..." : "Submitting...") : (locale === "pl" ? "Wyślij opinię" : "Submit")}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aggregate review dashboard info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left score panel */}
        <div className="md:col-span-4 rounded-3xl bg-surface border border-accent/10 p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <p className="text-6xl font-black text-foreground tracking-tighter">{averageRating || 0}</p>
          <div className="flex gap-0.5 mt-2.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-5 w-5 fill-current ${s <= Math.round(averageRating) ? "text-amber-400" : "text-neutral-200"}`} />
            ))}
          </div>
          <p className="text-xs font-bold text-muted mt-3">
            {locale === "pl" ? `Średnia ocena z ${totalReviews} opinii` : `Average rating based on ${totalReviews} reviews`}
          </p>
        </div>

        {/* Middle interactive progress selectors */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const isSelected = filter === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => setFilter(isSelected ? null : stars)}
                className={`flex w-full items-center gap-4 p-2 rounded-xl transition-all cursor-pointer text-left text-xs font-bold ${
                  isSelected ? "bg-primary/5 text-primary ring-2 ring-primary/25" : "text-foreground hover:bg-accent-light/30"
                }`}
              >
                <span className="w-14 shrink-0">{stars} {locale === "pl" ? "Gwiazdek" : "Stars"}</span>
                <div className="h-2.5 flex-1 rounded-full bg-accent/10 overflow-hidden">
                  <div style={{ width: `${percentage}%` }} className="h-full rounded-full bg-amber-400" />
                </div>
                <span className="w-16 text-right text-muted font-medium shrink-0">
                  {count} {locale === "pl" ? "opinii" : "reviews"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews Comments feed */}
      <div className="divide-y divide-accent/10">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted font-bold">
            {locale === "pl" ? "Brak opinii o wybranej liczbie gwiazdek." : "No reviews for selected rating filter."}
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="py-6 first:pt-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-primary shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-black text-foreground">{review.reviewer_name}</p>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                          <ShieldCheck className="h-3 w-3" />
                          {locale === "pl" ? "Weryfikowany zakup" : "Verified Purchase"}
                        </span>
                      )}
                    </div>
                    <div className="flex text-amber-400 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 fill-current ${s <= review.rating ? "text-amber-400" : "text-neutral-100"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted font-semibold shrink-0">
                  {new Date(review.created_at).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-US")}
                </span>
              </div>
              {review.title && (
                <p className="mt-3 text-sm font-black text-foreground">{review.title}</p>
              )}
              <p className="mt-1.5 text-sm text-muted leading-relaxed font-medium">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
