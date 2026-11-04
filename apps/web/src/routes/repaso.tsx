import { createFileRoute } from '@tanstack/react-router';
import { loadPages } from '../features/content/data/load-pages';
import { useReadingProgress } from '../features/progress/hooks/use-reading-progress';
import { ReviewScreen } from '../features/review/components/review-screen';
import { loadReviewDigest } from '../features/review/data/load-review-digest';

const pages = loadPages();

const ReviewRoute = () => {
  const digests = Route.useLoaderData();
  const { readPageIds, status, signedIn } = useReadingProgress();
  return (
    <ReviewScreen
      pages={pages}
      digests={digests}
      readPageIds={readPageIds}
      progressStatus={status}
      signedIn={signedIn}
    />
  );
};

export const Route = createFileRoute('/repaso')({
  loader: loadReviewDigest,
  component: ReviewRoute,
});
