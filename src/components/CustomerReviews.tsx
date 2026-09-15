import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';
import { Review } from '../types';
import { useAuth } from '../context/AuthContext';

interface CustomerReviewsProps {
  productId: string;
  productName: string;
  reviews: Review[];
  isLoading: boolean;
  onSubmitReview: (reviewData: { rating: number; title: string; review: string; customerName: string }) => Promise<void>;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  productId,
  productName,
  reviews,
  isLoading,
  onSubmitReview,
}) => {
  const { customerProfile } = useAuth();
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(customerProfile?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100 : 0
  }));

  // Sorted reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    // 'recent'
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmitReview({
        rating: newRating,
        title: newTitle || 'Exceptional quality coconut oil',
        review: newComment,
        customerName: reviewerName || 'Verified Kerala Customer'
      });
      setNewComment('');
      setNewTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Rating Header & Summary breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-emerald-950/5 border border-emerald-900/10">
        <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-2xl shadow-xs border border-stone-100">
          <span className="font-serif text-4xl font-bold text-stone-900">{averageRating}</span>
          <div className="flex items-center gap-1 text-amber-500 my-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-stone-500 font-medium">Based on {reviews.length} verified reviews</span>
        </div>

        <div className="md:col-span-2 space-y-2 flex flex-col justify-center bg-white p-5 rounded-2xl shadow-xs border border-stone-100">
          {ratingCounts.map(item => (
            <div key={item.star} className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-stone-700 w-12 flex items-center gap-1">
                {item.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-stone-400 w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-800" />
            <span>Write a Customer Review for {productName}</span>
          </h4>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
            100% Verified Purchases Only
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-700 font-medium">Your Rating:</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                type="button"
                key={star}
                onClick={() => setNewRating(star)}
                className="p-1 text-amber-500 hover:scale-125 transition-transform"
                title={`${star} Stars`}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your Name (e.g. Rahul Menon)"
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            required
            className="text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
          />
          <input
            type="text"
            placeholder="Review Title (e.g. Pure Malabar aroma, zero filtration!)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Share how the oil tasted in cooking, its authentic fragrance, packaging condition, or health benefits..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          required
          className="w-full text-xs p-3.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing Review...' : 'Submit Verified Review'}
          </button>
        </div>
      </form>

      {/* Review List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <h5 className="font-serif text-sm font-bold text-stone-900">
            Customer Feedbacks ({reviews.length})
          </h5>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest')}
              className="text-xs px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-500">Loading verified reviews...</div>
        ) : sortedReviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
            No reviews published yet for this batch. Be the first customer to share your feedback!
          </div>
        ) : (
          sortedReviews.map(rev => (
            <div key={rev.id} className="p-5 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                    {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">{rev.customerName}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {rev.verifiedPurchase && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200/50">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Verified Buyer
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-amber-500">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                    }`}
                  />
                ))}
                {rev.title && <span className="font-bold text-xs text-stone-800 ml-2">{rev.title}</span>}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">{rev.review}</p>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
                <button className="flex items-center gap-1 hover:text-emerald-800 transition-colors">
                  <ThumbsUp className="w-3 h-3" /> Helpful (1)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
