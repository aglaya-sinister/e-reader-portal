import FeaturedCarousel from "@/components/FeaturedCarousel";
import NewReleases from "@/components/NewReleases";
import TagCloud from "@/components/TagCloud";
import TopBar from "@/components/TopBar";
import YourLibrary from "@/components/YourLibrary";
import { featured, newReleases } from "@/data/books";
import { tags } from "@/data/tags";

export default function Home() {
  return (
    <>
      <TopBar />

      <main className="flex-1 pb-20">
        <FeaturedCarousel books={featured} />

        <hr className="mx-auto my-6 max-w-[1500px] border-line" />

        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_280px]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <TagCloud tags={tags} />
          </aside>

          <div className="space-y-10">
            <NewReleases books={newReleases} />
          </div>

          <aside className="xl:sticky xl:top-20 xl:self-start">
            <YourLibrary />
          </aside>
        </div>
      </main>
    </>
  );
}
