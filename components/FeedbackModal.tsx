// components/FeedbackModal.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';

interface FeedbackModalProps {
  onClose: () => void;
  reportId: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, reportId }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Send feedback to the backend API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback, reportId }),
      });

      if (response.ok) {
        setSuccess(true);
        setFeedback('');
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Provide Feedback">
      {success ? (
        <div className="text-center">
          <p className="text-green-600">Thank you for your feedback!</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please provide your feedback..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default FeedbackModal;
