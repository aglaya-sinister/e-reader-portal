import TopBar from "@/components/TopBar";
import LibraryLists from "@/components/shelf/LibraryLists";

export const metadata = { title: "Your Library — e-reader-portal" };

export default function LibraryPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-20 pt-8 sm:px-6">
        <LibraryLists />
      </main>
    </>
  );
}
