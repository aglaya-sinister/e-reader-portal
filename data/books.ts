/**
 * The painting used as a card's backdrop. All chosen to be public domain, and
 * matched to the book's subject or to a painter the author sat alongside.
 *
 * `src` is a path under /public. While it is absent the card falls back to a
 * generated gradient, so the layout works either way.
 */
export type Artwork = {
  painting: string;
  artist: string;
  year: string;
  /** Why this painting was picked for this book. */
  note: string;
  src?: string;
};

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
  artwork: Artwork;
};

export type Review = {
  id: string;
  reader: string;
  initials: string;
  bookId: string;
  stars: number;
  body: string;
  postedAt: string;
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
    artwork: {
      painting: "An Experiment on a Bird in the Air Pump",
      artist: "Joseph Wright of Derby",
      year: "1768",
      src: "/artwork/frankenstein.jpg",
      note: "A demonstrator holds a life in his hands while the room watches, half thrilled and half appalled — the novel's exact moral situation, painted fifty years early.",
    },
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
    artwork: {
      painting: "Romans during the Decadence",
      artist: "Thomas Couture",
      year: "1847",
      src: "/artwork/dorian-gray.jpg",
      note: "Beautiful people at the exhausted end of an orgy, watched by statues of better men — pleasure as a career, and the bill arriving.",
    },
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
    artwork: {
      painting: "Whalers (The Whale Ship)",
      artist: "J. M. W. Turner",
      year: "c. 1845",
      src: "/artwork/moby-dick.jpg",
      note: "Turner painted a whaling series in the years just before the novel, and Melville knew his work — the closest thing to an illustration Moby-Dick has.",
    },
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
    artwork: {
      painting: "The Nightmare",
      artist: "Henry Fuseli",
      year: "1781",
      src: "/artwork/dracula.jpg",
      note: "A sleeping woman, a crouching incubus, and a horse's head at the curtain — the novel's central image a hundred years before anyone wrote it down.",
    },
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
    artwork: {
      painting: "Reflections on the Thames, Westminster",
      artist: "John Atkinson Grimshaw",
      year: "1880",
      src: "/artwork/jekyll-hyde.jpg",
      note: "Gaslight doubled in black water — a respectable city and its inverted copy, which is the whole trick of the novella.",
    },
    blurb:
      "A lawyer looks into the ugly young man named in his friend's will and finds a door, a cheque, and a chemistry set. Short, airtight, and structured so the reveal lands as a confession rather than a twist.",
  },
];

export const newReleases: Book[] = [
  {
    id: "time-machine",
    title: "The Time Machine",
    author: "H. G. Wells",
    year: 1895,
    hue: 188,
    rating: 4.1,
    genres: ["Science Fiction", "Dystopia"],
    artwork: {
      painting: "The Great Day of His Wrath",
      artist: "John Martin",
      year: "1851–53",
      src: "/artwork/time-machine.jpg",
      note: "Martin painting the end of everything at full volume — the register the Traveller's last few centuries are pitched in.",
    },
    blurb:
      "An inventor travels forward to a garden world of gentle idlers and, beneath it, the machinery that keeps them fed. The further he goes, the less the future is about people at all — the last stop is a cold beach under a dying sun.",
  },
  {
    id: "jane-eyre",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    year: 1847,
    hue: 24,
    rating: 4.6,
    genres: ["Romance", "Gothic", "Bildungsroman"],
    artwork: {
      painting: "The Governess",
      artist: "Rebecca Solomon",
      year: "1851",
      src: "/artwork/jane-eyre.jpg",
      note: "A governess at work in the corner while the family enjoys itself in the light — paid, present, and not counted as company.",
    },
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
    artwork: {
      painting: "Morning in the Tropics",
      artist: "Frederic Edwin Church",
      year: "1877",
      src: "/artwork/heart-of-darkness.jpg",
      note: "A river running back into tropical haze, the far bank dissolving — the journey upstream, painted as pure atmosphere.",
    },
    blurb:
      "A riverboat captain goes upstream after a celebrated agent and finds the enterprise rotten to its root.",
  },
  {
    id: "turn-of-the-screw",
    title: "The Turn of the Screw",
    author: "Henry James",
    year: 1898,
    hue: 268,
    rating: 3.9,
    genres: ["Horror", "Ghost Story"],
    artwork: {
      painting: "L'étang de Ville-d'Avray",
      artist: "Jean-Baptiste-Camille Corot",
      year: "c. 1867",
      src: "/artwork/turn-of-the-screw.jpg",
      note: "A still lake behind feathered trees — Corot's silvery ambiguity suits a story that never confirms whether anyone is standing across the water.",
    },
    blurb:
      "A governess sees figures on the tower and the lake. Whether the children see them too is the whole book.",
  },
  {
    id: "wuthering-heights",
    title: "Wuthering Heights",
    author: "Emily Brontë",
    year: 1847,
    hue: 340,
    rating: 4.0,
    genres: ["Romance", "Gothic", "Tragedy"],
    artwork: {
      painting: "Wandering Shadows",
      artist: "Peter Graham",
      year: "1878",
      src: "/artwork/wuthering-heights.jpg",
      note: "Cloud shadows dragging across open highland moor — weather as temperament, which is exactly how the moors function in this book.",
    },
    blurb:
      "Two houses on the moors, three generations, and a grudge that outlives everyone who started it.",
  },
];

export const allBooks: Book[] = [...featured, ...newReleases];

export const bookById = (id: string) => allBooks.find((b) => b.id === id);

// Genre helpers live in data/tags.ts — they span works and stories too.

export const reviews: Review[] = [
  {
    id: "r1",
    reader: "Wren A.",
    initials: "WA",
    bookId: "frankenstein",
    stars: 5,
    body:
      "This book is awesome! Went in expecting a monster and got a custody dispute instead. The creature's chapters are the best thing here — nobody warned me he'd be the most articulate person in the story.",
    postedAt: "3 days ago",
  },
  {
    id: "r2",
    reader: "Desmond K.",
    initials: "DK",
    bookId: "moby-dick",
    stars: 3,
    body:
      "Nah, I don't like it. Forty pages on rope. I understand that the digressions are the point, I just didn't want the point that badly.",
    postedAt: "1 week ago",
  },
  {
    id: "r3",
    reader: "Ines M.",
    initials: "IM",
    bookId: "dracula",
    stars: 5,
    body:
      "The letters-and-diaries format does something a straight narrator couldn't: you spend the whole middle knowing more than any single character does, and it's unbearable.",
    postedAt: "2 weeks ago",
  },
  {
    id: "r4",
    reader: "Tobias R.",
    initials: "TR",
    bookId: "dorian-gray",
    stars: 4,
    body:
      "Lord Henry gets all the good lines and none of the consequences, which I think is deliberate and still annoyed me.",
    postedAt: "3 weeks ago",
  },
];

