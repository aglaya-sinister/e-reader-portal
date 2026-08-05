/**
 * Authors behind the catalog, plus the works of theirs we do not carry.
 *
 * `works` holds novels and book-length work; `stories` holds short fiction and
 * novellas, which for several of these writers is where the best of them is.
 *
 * Each author carries a note on how they write rather than a life story, and
 * the bibliographies are real. Covers are generated from `hue` by <BookCover>,
 * the same as everywhere else on the site — no cover scans.
 */

export type AuthorWork = {
  title: string;
  year: string;
  /** One line on what it is. */
  note: string;
  /** Base hue (0-360) for the generated cover. */
  hue: number;
  /**
   * How many divisions the work really has. Short stories are a single
   * unbroken text (1); linked cycles carry their number of tales. Where this is
   * left off, the reader falls back to a placeholder count — see library.ts.
   */
  chapters?: number;
  /** Real titles of the divisions, where the work has them. */
  chapterTitles?: string[];
  /** What a division is called here — "Tale" for a linked story cycle. */
  chapterUnit?: string;
  /** Genres, from the same vocabulary the catalog books use. */
  genres?: string[];
  /**
   * Pin the Gutenberg edition instead of letting the ingest search for it.
   * Needed wherever a title search is unreliable — a French author's work is
   * catalogued under its English title by one translator and not another — and
   * wherever the English text exists only as separate volumes, which go in
   * `gutenbergIds` and are joined in order.
   */
  gutenbergId?: number;
  gutenbergIds?: number[];
  /** Take only part of the joined text: `[fromChapter, count]`, 0-based. */
  slice?: [number, number];
  /**
   * Cut the source at this heading, for volumes that bundle a second piece
   * after the work — "The Romance of a Mummy *and Egypt*". Matched as a line of
   * its own, and only in the back half, so a mention in the prose is safe.
   */
  stopAt?: string;
};

export type Author = {
  id: string;
  name: string;
  lived: string;
  nationality: string;
  /** One or two sentences on how they write. */
  style: string;
  portrait: {
    /** Path under /public. Absent falls back to a monogram plate. */
    src?: string;
    /** Painter or photographer, and year. */
    credit: string;
  };
  works: AuthorWork[];
  /** Short fiction and novellas. Omitted for authors who wrote none. */
  stories?: AuthorWork[];
};

/**
 * "Robert Louis Stevenson" -> "robert-louis-stevenson"
 * "Charlotte Brontë" -> "charlotte-bronte"
 *
 * Accents are folded rather than dropped — without the NFD pass "Brontë"
 * collapses to "bront" and stops matching the author id.
 */
export function authorSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const authors: Author[] = [
  {
    id: "robert-louis-stevenson",
    name: "Robert Louis Stevenson",
    lived: "1850–1894",
    nationality: "Scottish",
    style: "Short declarative sentences doing a great deal of work, and chapters that end on a turn rather than a summary. He is a master of pace: description is rationed, action is reported cleanly, and the reader is trusted to feel the weight of things without being told. His range is wider than the adventure label suggests — Scots dialect horror, psychological case study, essay, fable and late South Seas realism — but the method is constant: put a decent man in a position where every available choice costs him something, and decline to resolve it comfortably.",
    portrait: {
      src: "/authors/robert-louis-stevenson.jpg",
      credit: "Girolamo Nerli, 1892",
    },
    works: [
      { title: "Treasure Island", year: "1883", note: "The map, the parrot, and Long John Silver — the book that fixed how pirates behave.", hue: 34, genres: ["Adventure", "Sea Story"], chapters: 34 },
      { title: "Kidnapped", year: "1886", note: "A boy cheated of his inheritance, shipped off, and dragged across the Highlands after the '45.", hue: 152, genres: ["Adventure", "Historical"], chapters: 30 },
      { title: "The Master of Ballantrae", year: "1889", note: "Two brothers, one estate, and a hatred that outlasts several attempts to end it.", hue: 274, genres: ["Adventure", "Gothic", "Tragedy"], chapters: 12 },
      { title: "Weir of Hermiston", year: "1896", note: "A hanging judge and his son. Unfinished at his death, and widely thought his best.", hue: 220, genres: ["Historical", "Tragedy"], chapters: 9 },
      { title: "A Child's Garden of Verses", year: "1885", note: "Poems written from inside a sickbed childhood, and none of them self-pitying.", hue: 196, genres: ["Poetry"], chapters: 1 },
      { title: "Travels with a Donkey in the Cévennes", year: "1879", note: "Twelve days walking through the mountains with an uncooperative donkey named Modestine.", hue: 88, genres: ["Travel"], chapters: 3 },
      { title: "The Black Arrow", year: "1888", note: "A romance of the Wars of the Roses, written fast and for money, and still good fun.", hue: 8, genres: ["Adventure", "Historical"], chapters: 5 },
    ],
    stories: [
      {
        title: "The Suicide Club",
        year: "1878",
        note: "Prince Florizel infiltrates a London club for men who wish to die and cannot manage it alone. Three linked tales, opening with a young man distributing cream tarts to strangers.",
        hue: 350, genres: ["Mystery", "Adventure"],
        chapters: 3,
        chapterUnit: "Tale",
        chapterTitles: [
          "Story of the Young Man with the Cream Tarts",
          "Story of the Physician and the Saratoga Trunk",
          "The Adventure of the Hansom Cabs",
        ],
      },
      {
        title: "The Rajah's Diamond",
        year: "1878",
        note: "The companion cycle: an enormous stolen diamond passes from hand to hand, ruining each holder in turn, until Florizel settles it for good.",
        hue: 44, genres: ["Mystery", "Adventure"],
        chapters: 4,
        chapterUnit: "Tale",
        chapterTitles: [
          "Story of the Bandbox",
          "Story of the Young Man in Holy Orders",
          "Story of the House with the Green Blinds",
          "The Adventure of Prince Florizel and a Detective",
        ],
      },
      { title: "Markheim", year: "1885", note: "A murderer in a dealer's shop on Christmas Day is joined by a visitor who knows exactly what he has done.", hue: 268, genres: ["Gothic", "Philosophical"] },
      { title: "Thrawn Janet", year: "1881", note: "A minister and his servant in a Scots-language tale of possession that frightened even Stevenson's wife.", hue: 120, genres: ["Horror", "Gothic"] },
      { title: "The Body Snatcher", year: "1884", note: "Two medical students and the trade in fresh corpses in Edinburgh. Based on real crimes.", hue: 96, genres: ["Horror", "Gothic"] },
      { title: "The Bottle Imp", year: "1891", note: "A bottle that grants any wish and must be sold on for less than you paid, or you are damned.", hue: 176, genres: ["Fable", "Horror"] },
      { title: "The Beach of Falesá", year: "1892", note: "A South Seas trader, a sham marriage and a rival's fake magic. Bluntly honest about colonial conduct, and censored for it.", hue: 24, genres: ["Adventure", "Novella"] },
      { title: "Olalla", year: "1885", note: "A convalescent officer in a decayed Spanish house, and the family whose bloodline has gone wrong.", hue: 300, genres: ["Gothic", "Horror"] },
    ],
  },
  {
    id: "mary-shelley",
    name: "Mary Shelley",
    lived: "1797–1851",
    nationality: "English",
    style: "She builds by nesting: an outer narrator receives a testimony, which contains another testimony inside it, so that judgement keeps being handed on and never quite lands. The prose is Romantic in register, given to weather and mountains and long formal speeches, and the effect is deliberate — her monsters and exiles argue their case in the same educated diction as the men who condemn them. Her recurring structural interest is responsibility: who made this, who abandoned it, and what the reader is supposed to do with the fact that both parties are articulate.",
    portrait: {
      src: "/authors/mary-shelley.jpg",
      credit: "Richard Rothwell, 1840",
    },
    works: [
      { title: "The Last Man", year: "1826", note: "A plague empties the earth; one survivor writes it down. Science fiction a century early.", hue: 210, genres: ["Science Fiction", "Dystopia"], chapters: 3 },
      { title: "Valperga", year: "1823", note: "A historical novel of a fourteenth-century Italian tyrant and the two women who see through him.", hue: 24, genres: ["Historical", "Tragedy"] },
      { title: "Mathilda", year: "1819", note: "A short, raw novel of a father's incestuous confession. Suppressed by Godwin; unpublished until 1959.", hue: 300, genres: ["Gothic", "Tragedy"] },
      { title: "Lodore", year: "1835", note: "A separated family, an exile in Illinois, and a study of how daughters are educated for dependence.", hue: 130, genres: ["Romance"] },
      { title: "Falkner", year: "1837", note: "Her last novel: a guardian with a buried crime, and the daughter who refuses to abandon him.", hue: 258, genres: ["Gothic", "Romance"] },
    ],
    stories: [
      { title: "The Mortal Immortal", year: "1833", note: "An alchemist's assistant drinks the elixir at sixteen and is still alive at three hundred and twenty-three, watching his wife age.", hue: 190, genres: ["Gothic", "Science Fiction"] },
      { title: "Transformation", year: "1831", note: "A ruined young nobleman trades bodies with a misshapen stranger, on terms he does not read closely enough.", hue: 286, genres: ["Gothic", "Fable"] },
      { title: "Roger Dodsworth: The Reanimated Englishman", year: "1826", note: "A man frozen in an avalanche in 1654 is thawed out and finds the world has moved on without consulting him.", hue: 200, genres: ["Satire", "Science Fiction"] },
      { title: "The Mourner", year: "1830", note: "A young woman living in seclusion with a grief she will not explain, and the survivor's guilt beneath it.", hue: 246, genres: ["Gothic", "Tragedy"] },
    ],
  },
  {
    id: "oscar-wilde",
    name: "Oscar Wilde",
    lived: "1854–1900",
    nationality: "Irish",
    style: "The epigram is not decoration but structure — his plays advance by inverted commonplaces, each line reversing the one before, until the pattern itself becomes the argument. Dialogue carries almost everything; the wittiest character is usually the least reliable and often the most nearly right. In the prose the surface is the subject: beauty, pose and reputation are treated as real forces with real consequences, and the moral arrives late, quietly, and without the comfort of a lesson.",
    portrait: {
      src: "/authors/oscar-wilde.jpg",
      credit: "Napoleon Sarony, 1882",
    },
    works: [
      { title: "The Importance of Being Earnest", year: "1895", note: "Two men, two invented alibis, and the most efficient farce in English.", hue: 48, genres: ["Drama", "Satire"], chapters: 3 },
      { title: "Lady Windermere's Fan", year: "1892", note: "A wife certain of her own goodness, and the woman with a past who saves her anyway.", hue: 330, genres: ["Drama", "Satire"], chapters: 4 },
      { title: "An Ideal Husband", year: "1895", note: "Blackmail in a political marriage, and a hard question about forgiving ambition.", hue: 200, genres: ["Drama", "Satire"], chapters: 4 },
      { title: "Salomé", year: "1891", note: "A one-act tragedy written in French and banned in Britain for putting biblical figures on stage.", hue: 356, genres: ["Drama", "Tragedy"], chapters: 1 },
      { title: "De Profundis", year: "1905", note: "The long letter from Reading Gaol — bitter, self-accusing, and unlike anything else he wrote.", hue: 240, genres: ["Non-fiction"] },
      { title: "The Ballad of Reading Gaol", year: "1898", note: "Written after his release, about a hanging he witnessed inside.", hue: 216, genres: ["Poetry"] },
    ],
    stories: [
      { title: "The Canterville Ghost", year: "1887", note: "An American family buys an English haunted house and declines to be frightened, to the ghost's professional distress.", hue: 160, genres: ["Ghost Story", "Satire"] },
      { title: "Lord Arthur Savile's Crime", year: "1887", note: "A palm reader predicts a murder, so a conscientious young man sets about committing one before his wedding.", hue: 36, genres: ["Satire", "Mystery"] },
      { title: "The Happy Prince and Other Tales", year: "1888", note: "Fairy tales for children that are considerably sadder than children expect — the statue, the swallow, the selfish giant.", hue: 170, genres: ["Fable"] },
      { title: "A House of Pomegranates", year: "1891", note: "Four longer, darker fairy tales, which Wilde insisted were not written for children at all.", hue: 310, genres: ["Fable"] },
      { title: "The Model Millionaire", year: "1887", note: "A beggar being painted turns out to be a baron, and rewards the only man who was kind to him.", hue: 66, genres: ["Satire"] },
    ],
  },
  {
    id: "herman-melville",
    name: "Herman Melville",
    lived: "1819–1891",
    nationality: "American",
    style: "He writes at several altitudes at once — a chapter of plot, then a chapter of taxonomy, then a passage of Shakespearean pitch — and refuses to apologise for the joins. The digressions are the argument: by the time a whale has been classified, dissected and mythologised, the reader has been taught to see the world as unstable and over-full of meaning. His sentences swell and subordinate, piling clause on clause toward a rhetorical crest, then drop without warning into flat sailor's prose.",
    portrait: {
      src: "/authors/herman-melville.jpg",
      credit: "Joseph Oriel Eaton, 1870",
    },
    works: [
      { title: "Typee", year: "1846", note: "Four months among the Marquesans, sold as fact and considerably improved in the telling.", hue: 140, genres: ["Adventure", "Travel"], chapters: 34 },
      { title: "Omoo", year: "1847", note: "The sequel: mutiny, a Tahitian jail, and beachcombing across the islands.", hue: 172, genres: ["Adventure", "Travel"], chapters: 82 },
      { title: "Redburn", year: "1849", note: "A first voyage to Liverpool, and a young man discovering how little his gentility is worth.", hue: 264, genres: ["Sea Story", "Bildungsroman"], chapters: 62 },
      { title: "Pierre", year: "1852", note: "An ambitious domestic tragedy that baffled reviewers and finished his commercial standing.", hue: 318, genres: ["Philosophical", "Tragedy"], chapters: 26 },
      { title: "The Confidence-Man", year: "1857", note: "A Mississippi steamboat, a series of swindlers, and possibly only one of them.", hue: 96, genres: ["Satire", "Philosophical"], chapters: 45 },
    ],
    stories: [
      { title: "Bartleby, the Scrivener", year: "1853", note: "A clerk who would prefer not to, and an employer with no idea what to do about it.", hue: 30, genres: ["Philosophical", "Satire"] },
      { title: "Benito Cereno", year: "1855", note: "An American captain boards a Spanish slaver and misreads everything he sees, at length.", hue: 350, genres: ["Sea Story", "Mystery"] },
      { title: "Billy Budd, Sailor", year: "1924", note: "Found in his desk decades after his death: innocence, law, and a hanging nobody wants.", hue: 206, genres: ["Sea Story", "Tragedy"] },
      { title: "The Encantadas", year: "1854", note: "Ten sketches of the Galápagos — volcanic rock, tortoises, castaways and one abandoned woman.", hue: 108, genres: ["Travel", "Sea Story"] },
      { title: "The Paradise of Bachelors and the Tartarus of Maids", year: "1855", note: "A comfortable London dinner set beside a New England paper mill, in deliberate accusation.", hue: 228, genres: ["Satire"] },
      { title: "The Lightning-Rod Man", year: "1854", note: "A salesman arrives during a thunderstorm selling protection from it.", hue: 54, genres: ["Satire", "Fable"] },
    ],
  },
  {
    id: "bram-stoker",
    name: "Bram Stoker",
    lived: "1847–1912",
    nationality: "Irish",
    style: "He assembles rather than narrates: letters, diaries, telegrams, ships' logs and newspaper cuttings, each written by someone who holds only part of the picture. The method produces its own dread — the reader collates the evidence long before the characters compare notes, and the horror sits in that gap. His prose is functional and unshowy by design, which makes the eruptions of the uncanny land harder against it.",
    portrait: {
      src: "/authors/bram-stoker.jpg",
      credit: "W. & D. Downey, photogravure",
    },
    works: [
      { title: "The Jewel of Seven Stars", year: "1903", note: "An Egyptologist attempts to resurrect a queen in a Kensington bedroom. It goes badly.", hue: 44, genres: ["Horror", "Gothic"] },
      { title: "The Lair of the White Worm", year: "1911", note: "His last novel, and his strangest: an ancient serpent living under an English estate.", hue: 108, genres: ["Horror", "Gothic"] },
      { title: "The Lady of the Shroud", year: "1909", note: "A Balkan romance disguised, for most of its length, as another vampire novel.", hue: 226, genres: ["Gothic", "Romance"] },
      { title: "The Snake's Pass", year: "1890", note: "His first novel — a shifting bog in the west of Ireland, and buried French gold.", hue: 158, genres: ["Adventure", "Romance"] },
    ],
    stories: [
      { title: "Dracula's Guest", year: "1914", note: "A traveller caught in a snowstorm at a suicide's tomb on Walpurgis Night. Widely thought a deleted opening chapter.", hue: 262, genres: ["Horror", "Gothic"] },
      { title: "The Judge's House", year: "1891", note: "A student takes quiet lodgings to study, and finds the hanging judge's rope still in the wall.", hue: 20, genres: ["Ghost Story", "Horror"] },
      { title: "The Squaw", year: "1893", note: "A tourist party at Nuremberg, an iron maiden, and a very ill-advised joke.", hue: 348, genres: ["Horror"] },
      { title: "The Burial of the Rats", year: "1914", note: "A young Englishman lost in the rag-pickers' slums outside Paris, being slowly encircled.", hue: 88, genres: ["Horror", "Adventure"] },
      { title: "Under the Sunset", year: "1881", note: "Eight fairy tales for children, several of which are frankly terrifying.", hue: 286, genres: ["Fable"] },
    ],
  },
  {
    id: "charlotte-bronte",
    name: "Charlotte Brontë",
    lived: "1816–1855",
    nationality: "English",
    style: "First person that argues with you directly, breaking off to address the reader as an equal and occasionally as an opponent. Her narrators are watchful, unbeautiful by their own account, and morally stubborn; the drama is interior, and the plot mostly supplies pressure for the interior to work against. The prose is dense with feeling but tightly controlled — long paragraphs of self-examination, then a short sentence that settles the matter.",
    portrait: {
      src: "/authors/charlotte-bronte.jpg",
      credit: "George Richmond, 1850",
    },
    works: [
      { title: "Villette", year: "1853", note: "An Englishwoman teaching in a Belgian boarding school. Her most controlled and least consoling book.", hue: 250, genres: ["Romance", "Bildungsroman"], chapters: 42 },
      { title: "Shirley", year: "1849", note: "Luddite machine-breaking in Yorkshire, and two women with opposite relationships to money.", hue: 112, genres: ["Romance", "Historical"], chapters: 36 },
      { title: "The Professor", year: "1857", note: "Written first, published last — the Brussels material she would rework into Villette.", hue: 22, genres: ["Romance", "Bildungsroman"], chapters: 25 },
      { title: "Poems by Currer, Ellis and Acton Bell", year: "1846", note: "The three sisters in one volume under male pen names. It sold two copies.", hue: 292, genres: ["Poetry"] },
    ],
    stories: [
      { title: "The Green Dwarf", year: "1833", note: "A novella of the invented kingdom of Angria, written at seventeen for a miniature hand-sewn book.", hue: 132, genres: ["Historical", "Romance"] },
      { title: "The Spell", year: "1834", note: "An Angrian tale of the Duke of Zamorna and a secret twin, unpublished in her lifetime.", hue: 268, genres: ["Gothic", "Romance"] },
      { title: "Mina Laury", year: "1838", note: "The last of the Angria stories — a woman entirely defined by a devotion the story does not endorse.", hue: 340, genres: ["Romance", "Tragedy"] },
    ],
  },
  {
    id: "joseph-conrad",
    name: "Joseph Conrad",
    lived: "1857–1924",
    nationality: "Polish-British",
    style: "Late, deliberate and suspicious of clear accounts: a narrator recalls a story he heard from someone who may not have understood it either, and disclosure is withheld until its meaning has already shifted. He writes English as a third language and uses it with unusual weight, stacking adjectives to produce atmosphere rather than precision — a fog that is itself the point. Chronology is broken on purpose, so that a moral judgement forms in the reader before the facts justifying it arrive.",
    portrait: {
      src: "/authors/joseph-conrad.jpg",
      credit: "Photographer unknown",
    },
    works: [
      { title: "Lord Jim", year: "1900", note: "An officer abandons a sinking ship full of pilgrims and spends his life trying to outrun one moment.", hue: 200, genres: ["Modernism", "Sea Story"], chapters: 45 },
      { title: "Nostromo", year: "1904", note: "A South American republic, a silver mine, and the corruption of everyone who touches it.", hue: 42, genres: ["Modernism", "Tragedy"], chapters: 3 },
      { title: "The Secret Agent", year: "1907", note: "A shabby anarchist cell in London and a bombing that goes wrong in the worst way.", hue: 0, genres: ["Modernism", "Mystery"], chapters: 13 },
      { title: "Under Western Eyes", year: "1911", note: "A Russian student betrays an assassin and is sent to Geneva to live among exiles.", hue: 224, genres: ["Modernism", "Tragedy"] },
      { title: "Victory", year: "1915", note: "A recluse on an Indonesian island takes in a woman, and three men arrive to punish him for it.", hue: 168, genres: ["Modernism", "Adventure"] },
    ],
    stories: [
      { title: "The Secret Sharer", year: "1910", note: "A new captain hides a fugitive from another ship in his own cabin, and can no longer tell them apart.", hue: 192, genres: ["Sea Story", "Modernism"] },
      { title: "Youth", year: "1898", note: "Marlow's first telling: a doomed coal ship, and an old man remembering how good disaster felt at twenty.", hue: 30, genres: ["Sea Story", "Modernism"] },
      { title: "Typhoon", year: "1902", note: "A captain with no imagination sails straight into a storm, which turns out to be a qualification.", hue: 176, genres: ["Sea Story", "Adventure"] },
      { title: "An Outpost of Progress", year: "1897", note: "Two mediocre traders left alone at a Congo station. Conrad thought it his best short work.", hue: 96, genres: ["Modernism", "Satire"] },
      { title: "Amy Foster", year: "1901", note: "A shipwrecked Pole washes up in Kent, is taken for a madman, and dies of not being understood.", hue: 248, genres: ["Modernism", "Tragedy"] },
      { title: "The Lagoon", year: "1897", note: "A Malay man keeps vigil over his dying wife and confesses what he did to his brother to get her.", hue: 144, genres: ["Modernism", "Tragedy"] },
    ],
  },
  {
    id: "emily-bronte",
    name: "Emily Brontë",
    lived: "1818–1848",
    nationality: "English",
    style: "No moralising narrator, no reassurance, and a structure of nested tellers that keeps the reader at arm's length from people it would be unwise to approach. Servants and tenants report events they did not fully witness, and their prejudices are left uncorrected. The result is a book with no authorial voice to appeal to: passion, cruelty and grief are recorded with the same flat attention, and the symmetry of the two generations is left to make the argument on its own.",
    portrait: {
      src: "/authors/emily-bronte.jpg",
      credit: "Branwell Brontë, c. 1833",
    },
    works: [
      { title: "Poems by Currer, Ellis and Acton Bell", year: "1846", note: "Her twenty-one poems here are generally held to be the best work in the volume.", hue: 232 },
      { title: "The Gondal Poems", year: "1836–48", note: "Verse from an imaginary northern kingdom she and Anne invented as children and never abandoned.", hue: 288, genres: ["Poetry"] },
      { title: "The Belgian Essays", year: "1842", note: "French compositions written in Brussels — the only extended prose of hers besides the novel.", hue: 160, genres: ["Non-fiction"] },
    ],
  },
  {
    id: "alexandre-dumas",
    name: "Alexandre Dumas",
    lived: "1802–1870",
    nationality: "French",
    style: "Serial fiction written to a deadline and built for it: short chapters, hard cuts, and a hook at the end of nearly every one. Plot moves almost entirely through dialogue — characters explain, scheme and threaten in speech, and description is kept to whatever the scene needs to stand up. History supplies the furniture and the stakes rather than the subject; the real interest is loyalty under pressure, and how long friendship survives ambition. Prolific and unembarrassed about method, he worked with collaborators on plotting and research, which his detractors used against him and which changed the results not at all.",
    portrait: {
      src: "/authors/alexandre-dumas.jpg",
      credit: "Nadar, c. 1855",
    },
    works: [
      { title: "The Count of Monte Cristo", year: "1844–46", note: "A sailor is imprisoned on a lie, escapes with a fortune, and spends the rest of the book arriving very slowly in the lives of the men who put him there.", hue: 214, genres: ["Adventure", "Romance", "Tragedy"] },
      { title: "The Three Musketeers", year: "1844", note: "A Gascon boy comes to Paris with a yellow horse and a letter, picks three duels before lunch, and gains the friends he fights.", hue: 8, genres: ["Adventure", "Historical", "Romance"] },
      { title: "Twenty Years After", year: "1845", note: "The four reunite middle-aged and on opposing sides, through the Fronde and the execution of an English king.", hue: 32, genres: ["Adventure", "Historical"] },
      { title: "The Vicomte de Bragelonne", year: "1847", note: "The long third movement of the d'Artagnan story opens with a king restored and friendships beginning to strain.", hue: 148, genres: ["Adventure", "Historical"] },
      { title: "Ten Years Later", year: "1848", note: "The court of the young Louis XIV, where ambition is conducted almost entirely through manners.", hue: 268, genres: ["Adventure", "Historical", "Romance"] },
      { title: "Louise de la Vallière", year: "1848", note: "A king's affection settles on a shy maid of honour, and the machinery of Versailles turns to accommodate it.", hue: 330, genres: ["Romance", "Historical"] },
      { title: "The Man in the Iron Mask", year: "1850", note: "The end of the sequence: a masked prisoner, a substitution at the heart of the state, and four old friends who cannot all survive it.", hue: 240, genres: ["Adventure", "Historical", "Tragedy"] },
      { title: "The Black Tulip", year: "1850", note: "A horticulturist jailed in the aftermath of a lynching keeps three bulbs alive, and with them a prize worth a hundred thousand guilders.", hue: 288, genres: ["Historical", "Romance"] },
      { title: "Marguerite de Valois", year: "1845", note: "A royal wedding used as bait for the St Bartholomew's Day massacre, seen from inside the Louvre.", hue: 356, genres: ["Historical", "Tragedy", "Romance"] },
      { title: "The Companions of Jehu", year: "1857", note: "Royalist highwaymen rob government coaches to fund a rising, in the months after Bonaparte returns from Egypt.", hue: 96, genres: ["Adventure", "Historical"] },
      { title: "The Conspirators", year: "1843", note: "A young officer, left without a war, is drawn into a plot against the Regent of France.", hue: 190, genres: ["Historical", "Adventure"] },
      { title: "The Regent's Daughter", year: "1845", note: "A Breton conspirator and the Regent's convent-raised daughter, on opposite ends of the same plot.", hue: 60, genres: ["Historical", "Romance"] },
    ],
    stories: [
      { title: "The Borgias", year: "1839", note: "The first of the Celebrated Crimes: Alexander VI and his children, told as narrative rather than history.", hue: 350, genres: ["Non-fiction", "Historical"] },
      { title: "Mary Stuart", year: "1839", note: "Nineteen years of captivity and the warrant that ended them.", hue: 224, genres: ["Non-fiction", "Historical", "Tragedy"] },
      { title: "Karl Ludwig Sand", year: "1839", note: "A student assassinates a playwright he takes for a Russian agent, and becomes a martyr to people who never met him.", hue: 20, genres: ["Non-fiction", "Historical"] },
      { title: "Urbain Grandier", year: "1839", note: "The possessed nuns of Loudun, and the priest burned on their evidence.", hue: 128, genres: ["Non-fiction", "Historical", "Horror"] },
      { title: "Ali Pacha", year: "1839", note: "The Albanian warlord who ruled a corner of the Ottoman empire as his own and was destroyed by it.", hue: 44, genres: ["Non-fiction", "Historical"] },
      { title: "The Marquise de Brinvilliers", year: "1839", note: "A poisoner in the reign of Louis XIV, undone by papers found after her lover's death.", hue: 300, genres: ["Non-fiction", "Historical", "Mystery"] },
      { title: "Joan of Naples", year: "1839", note: "A queen accused of her husband's murder, tried at Avignon, and acquitted by a pope who needed her.", hue: 172, genres: ["Non-fiction", "Historical"] },
      { title: "The Countess of Saint-Géran", year: "1839", note: "A child stolen at birth and a lawsuit that ran for twenty years.", hue: 108, genres: ["Non-fiction", "Historical", "Mystery"] },
      { title: "Murat", year: "1839", note: "Napoleon's cavalryman turned King of Naples, and the firing squad that closed the account.", hue: 6, genres: ["Non-fiction", "Historical", "Tragedy"] },
      { title: "The Cenci", year: "1839", note: "A Roman family, a monstrous father, and the parricide Shelley also took up.", hue: 264, genres: ["Non-fiction", "Historical", "Tragedy"] },
    ],
  },
  {
    id: "theophile-gautier",
    name: "Théophile Gautier",
    lived: "1811–1872",
    nationality: "French",
    style: "He writes to be looked at. A room, a costume, a face is built up detail by detail until the description carries what the plot never states outright, and surfaces get the attention other novelists reserve for motive — which was the argument, pressed all his life, that a thing well made requires no further excuse. The fantastic then arrives inside that solidity and behaves as though it belongs there: a foot bought in a curiosity shop, a painted woman who steps down, a dead girl who keeps her appointments. The sentences are long, balanced and unhurried, and the irony is laid on so lightly that readers still disagree about where he is serious.",
    portrait: {
      src: "/authors/theophile-gautier.jpg",
      credit: "Nadar, c. 1856",
    },
    works: [
      { title: "Mademoiselle de Maupin", year: "1835", note: "A man, his mistress and the beautiful youth they both fall for, who is neither. The preface picked the fight over art and morality that Gautier spent his life continuing.", hue: 320, genres: ["Romance", "Philosophical"], chapters: 18, gutenbergIds: [48893, 48894] },
      { title: "Captain Fracasse", year: "1863", note: "An impoverished baron leaves his ruined castle with a troupe of strolling players and takes a stage name to fight under.", hue: 30, genres: ["Adventure", "Historical", "Romance"], chapters: 22, gutenbergId: 1235 },
      { title: "The Romance of a Mummy", year: "1858", note: "An English lord opens an intact tomb in the Valley of Kings, and the papyrus inside tells the story of the woman he has just unwrapped.", hue: 46, genres: ["Historical", "Gothic", "Romance"], chapters: 19, gutenbergId: 27724, stopAt: "_Egypt_" },
      { title: "Wanderings in Spain", year: "1843", note: "Six months of travel written up without a guidebook's manners — bullfights, bad roads, the Alhambra, and a great deal of looking.", hue: 14, genres: ["Travel", "Non-fiction"], chapters: 16, gutenbergId: 52763 },
      { title: "Enamels and Cameos", year: "1852", note: "Short, hard, highly finished poems, revised across twenty years. The book that taught the Parnassians what they wanted to be.", hue: 190, genres: ["Poetry"], chapters: 50, gutenbergId: 29521 },
      { title: "Charles Baudelaire, His Life", year: "1868", note: "Written as the preface to his dead friend's collected works, by the man Baudelaire had dedicated Les Fleurs du mal to.", hue: 252, genres: ["Non-fiction"], chapters: 26, gutenbergId: 47075 },
      { title: "Honoré de Balzac", year: "1859", note: "A working novelist on another one: the debts, the coffee, the revisions carried through twelve sets of proofs.", hue: 96, genres: ["Non-fiction"], chapters: 6, gutenbergId: 53398 },
      { title: "My Private Menagerie", year: "1869", note: "The cats, dogs, horses, lizards and magpies he lived among, described with the same care he gave to Spanish cathedrals.", hue: 140, genres: ["Non-fiction"], chapters: 5, gutenbergId: 30760 },
    ],
    stories: [
      { title: "Clarimonde", year: "1836", note: "A young priest is called to the deathbed of a famous courtesan and spends the rest of his life living two of them, one by night.", hue: 350, genres: ["Gothic", "Horror", "Romance"], gutenbergId: 22661 },
      { title: "King Candaules", year: "1844", note: "A king so proud of his wife's beauty that he shows her to his captain, and is answered exactly as Herodotus reports.", hue: 210, genres: ["Historical", "Tragedy"], chapters: 5, gutenbergId: 22660 },
      { title: "The Mummy's Foot", year: "1840", note: "A curiosity-shop paperweight turns out to belong to a princess who would like it back.", hue: 66, genres: ["Fable", "Ghost Story"], gutenbergId: 22662 },
    ],
  },
];

export const authorById = (id: string) => authors.find((a) => a.id === id);
export const authorByName = (name: string) =>
  authors.find((a) => a.id === authorSlug(name));
