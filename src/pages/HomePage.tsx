
import { BookCard } from "@/components/BookCard";

export function HomePage() {
  return (
    <div className="pt-20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Books</h1>
          <button className="text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <span>+</span> New Book
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BookCard
            title="The Iron Wars"
            genre="Sci-Fi"
            description="In a war torn galaxy, a daring pilot becomes embroiled in a conflict between a tyrannical empire and a fledgling rebellion"
            icon="📕"
          />
          <BookCard
            title="Ashes of Winter"
            genre="Fantasy"
            description=""
            icon="❄️"
          />
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">
              💬 What do you want to create today?
            </h2>
            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="Create a sarcastic villain for my space opera"
                className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-500"
              />
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
