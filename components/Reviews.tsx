import { bookById, type Review } from "@/data/books";
import StarRating from "./StarRating";

export default function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <section aria-labelledby="reviews">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-6 bg-line" aria-hidden />
        <h2 id="reviews" className="text-2xl font-semibold tracking-tight">
          Reviews
        </h2>
      </div>

      <ul className="divide-y divide-line rounded-2xl border border-line bg-ink-soft">
        {reviews.map((review) => {
          const book = bookById(review.bookId);
          return (
            <li key={review.id} className="flex gap-3 p-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-panel text-xs font-semibold text-cream/80">
                {review.initials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <StarRating value={review.stars} />
                  <span className="text-sm font-medium">{review.reader}</span>
                  <span className="text-xs text-muted">
                    on <span className="text-cream/70">{book?.title}</span> ·{" "}
                    {review.postedAt}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-cream/75">
                  {review.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
