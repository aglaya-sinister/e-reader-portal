export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  genres: string[];
  blurb: string;
  /** Base hue (0-360) used to generate the cover art and gradient fallback. */
  hue: number;
  rating: number;
};

export type Tag = {
  label: string;
  count: number;
};

export const featured: Book[] = [
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    year: 1818,
    hue: 168,
    rating: 4.5,
    genres: ["Gothic", "Science Fiction", "Tragedy"],
    blurb:
      "A student of unnatural philosophy assembles a living man from the parts of the dead, then flees the room the moment it opens its eyes. What follows is less a monster story than a long argument about who owed what to whom — told, in turn, by an explorer, a maker, and the made.",
  },
  {
    id: "dorian-gray",
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    year: 1890,
    hue: 292,
    rating: 4.2,
    genres: ["Gothic", "Philosophical", "Satire"],
    blurb:
      "A young man wishes his portrait would age in his place, and is granted it. He spends the next two decades testing how much a face can hide, while the canvas upstairs keeps an honest ledger of every appetite he indulges.",
  },
  {
    id: "moby-dick",
    title: "Moby-Dick",
    author: "Herman Melville",
    year: 1851,
    hue: 206,
    rating: 4.0,
    genres: ["Adventure", "Epic", "Sea Story"],
    blurb:
      "A sailor signs onto a whaler and finds its captain has no interest in oil, only in one particular white whale. Between chases the book stops to explain rope, rank, cetacean anatomy and the colour white — digressions that turn out to be the point.",
  },
  {
    id: "dracula",
    title: "Dracula",
    author: "Bram Stoker",
    year: 1897,
    hue: 8,
    rating: 4.4,
    genres: ["Horror", "Gothic", "Epistolary"],
    blurb:
      "Assembled entirely from letters, diaries, ship's logs and newspaper clippings, the case against the count is built by people who each hold one piece of it. The horror arrives early; the dread comes from watching them slowly compare notes.",
  },
  {
    id: "jekyll-hyde",
    title: "Strange Case of Dr Jekyll and Mr Hyde",
    author: "Robert Louis Stevenson",
    year: 1886,
    hue: 128,
    rating: 4.1,
    genres: ["Gothic", "Mystery", "Novella"],
    blurb:
      "A lawyer looks into the ugly young man named in his friend's will and finds a door, a cheque, and a chemistry set. Short, airtight, and structured so the reveal lands as a confession rather than a twist.",
  },
];

export const newReleases: Book[] = [
  {
    id: "monte-cristo",
    title: "The Count of Monte Cristo",
    author: "Alexandre Dumas",
    year: 1844,
    hue: 214,
    rating: 4.7,
    genres: ["Adventure", "Romance", "Tragedy"],
    blurb:
      "A young sailor, days from marriage and promotion, is denounced by three men who each want something small from his ruin. Fourteen years later a very rich stranger arrives in Paris and begins, with enormous patience, to give them what they asked for.",
  },
  {
    id: "jane-eyre",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    year: 1847,
    hue: 24,
    rating: 4.6,
    genres: ["Romance", "Gothic", "Bildungsroman"],
    blurb:
      "A governess with no money, no family and no intention of being agreeable takes a post at a house with an attic nobody discusses.",
  },
  {
    id: "heart-of-darkness",
    title: "Heart of Darkness",
    author: "Joseph Conrad",
    year: 1899,
    hue: 96,
    rating: 3.8,
    genres: ["Adventure", "Modernism"],
    blurb:
      "A riverboat captain goes upstream after a celebrated agent and finds the enterprise rotten to its root.",
  },
  {
    id: "three-musketeers",
    title: "The Three Musketeers",
    author: "Alexandre Dumas",
    year: 1844,
    hue: 8,
    rating: 4.5,
    genres: ["Adventure", "Historical", "Romance"],
    blurb:
      "A Gascon boy arrives in Paris on a ridiculous horse, contrives three duels before lunch, and ends the morning with the only friends he will ever need. Behind the swordplay sits a cardinal, a queen's indiscretion, and a woman far more dangerous than any of the men.",
  },
  {
    id: "wuthering-heights",
    title: "Wuthering Heights",
    author: "Emily Brontë",
    year: 1847,
    hue: 340,
    rating: 4.0,
    genres: ["Romance", "Gothic", "Tragedy"],
    blurb:
      "Two houses on the moors, three generations, and a grudge that outlives everyone who started it.",
  },
];

export const allBooks: Book[] = [...featured, ...newReleases];

export const bookById = (id: string) => allBooks.find((b) => b.id === id);

// Genre helpers live in data/tags.ts — they span works and stories too.


