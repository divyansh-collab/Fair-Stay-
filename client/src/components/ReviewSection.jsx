import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function ReviewSection({ listingId, reviews: initialReviews = [], onReviewAdded }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleStarClick = (value) => setRating(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || comment.trim().length < 10) {
      toast.error('Please provide a rating and a comment of at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.submitReview(listingId, { rating, comment: comment.trim() });
      const newReview = res.review || res.data?.review;
      setReviews([newReview, ...reviews]);
      setRating(0);
      setComment('');
      toast.success('Review posted!');
      if (onReviewAdded) onReviewAdded(newReview);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px' }}>Reviews ({reviews.length}) • {avgRating} ★</h3>

      {reviews.length === 0 && (
        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
          🖊️ No reviews yet. Be the first to share your experience!
        </p>
      )}

      {/* Existing reviews */}
      {reviews.map((rev) => (
        <div key={rev._id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
          {rev.author?.profilePhoto?.url ? (
            <img src={rev.author.profilePhoto.url} alt={rev.author.username} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ff5a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
              {rev.author?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{rev.author?.username || 'Anonymous'}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(rev.createdAt)}</span>
            </div>
            <div style={{ margin: '4px 0' }}>
              {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
            </div>
            <p style={{ margin: 0, color: '#334155', lineHeight: 1.4 }}>{rev.comment}</p>
          </div>
        </div>
      ))}

      {/* Write a Review Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: '24px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
        <h4 style={{ marginBottom: '8px', fontWeight: '600' }}>Write a Review</h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} onClick={() => handleStarClick(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
              viewBox="0 0 20 20" fill={star <= (hoverRating || rating) ? '#ff5a5f' : '#d1d5db'} width="24" height="24" style={{ cursor: 'pointer' }}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.374 2.455a1 1 0 00-.364 1.118l1.287 3.945c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.374 2.455c-.784.57-1.838-.197-1.539-1.118l1.286-3.945a1 1 0 00-.364-1.118L2.635 9.372c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.951-.69l1.286-3.945z"/>
            </svg>
          ))}
        </div>
        <textarea placeholder="Share your thoughts (min 10 characters)" value={comment} onChange={(e) => setComment(e.target.value)}
          rows={3} style={{ width: '100%', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '8px', resize: 'vertical', fontFamily: 'inherit' }} />
        <button type="submit" disabled={submitting} className="btn-coral"
          style={{ marginTop: '8px', padding: '8px 16px', fontWeight: '600', background: '#ff5a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: submitting ? 'wait' : 'pointer' }}>
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </form>
    </div>
  );
}
