/**
 * Authors behind the catalog, plus the works of theirs we do not carry.
 *
 * `works` holds novels and book-length work; `stories` holds short fiction and
 * novellas, which for several of these writers is where the best of them is.
 *
 * Biographies and bibliographies here are real. Covers are generated from `hue`
 * by <BookCover>, the same as everywhere else on the site — no cover scans.
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
};

export type Author = {
  id: string;
  name: string;
  lived: string;
  nationality: string;
  /** Two or three sentences of life. */
  bio: string;
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
    bio: "Born in Edinburgh to a family of lighthouse engineers, Stevenson trained for the law and then declined to practise it. Chronic lung illness kept him moving — France, California, Switzerland, the Adirondacks — in search of air he could breathe. He settled at last in Samoa, where the islanders called him Tusitala, the teller of tales, and where he died at forty-four.",
    style: "A deliberate stylist with far more range than the adventure-writer label allows: Scots historical fiction, psychological horror, essays, travel writing, fable, and late South Seas stories that turn a cold eye on the colonists among whom he was living. He argued the art of the novel with Henry James as an equal, and wrote plain sentences that are much harder to imitate than they look.",
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
    bio: "Daughter of the philosopher William Godwin and the pioneering feminist Mary Wollstonecraft, who died days after her birth. At eighteen she was on Lake Geneva with Byron and Percy Shelley when a wet summer and a ghost-story contest produced Frankenstein. She was widowed at twenty-four and spent the rest of her life writing, editing her husband's poetry, and raising their son.",
    style: "Framed narratives that pass the story from one unreliable hand to the next, and a persistent interest in what people owe the things they bring into being.",
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
    bio: "Dublin-born, Oxford-educated, and famous for his conversation before he was famous for his writing. He dominated the London stage in the 1890s, then lost everything in 1895 when a libel suit he had brought collapsed into his own prosecution and two years' hard labour. He died destitute in a Paris hotel at forty-six.",
    style: "The epigram as a load-bearing structure. Comedies built so the funniest character is usually the one telling the most dangerous truth.",
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
    bio: "Melville went to sea at twenty, deserted a whaler in the Marquesas, and turned the experience into two popular travel books. Moby-Dick, which followed, sold poorly and effectively ended his career as a novelist. He spent his last nineteen years as a customs inspector on the New York docks, writing poetry almost nobody read.",
    style: "Encyclopaedic digression welded to high rhetoric — a chapter of plot, then a chapter on rope, and no apology for either.",
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
    bio: "Bedridden until he was seven, Stoker grew into an athlete at Trinity College Dublin and then into a civil servant and theatre critic. For twenty-seven years he managed the Lyceum Theatre for the actor Henry Irving, a job that consumed most of his working life. Dracula was written in the margins of it, over seven years of notes.",
    style: "Documents rather than narration — letters, diaries, telegrams, cuttings — so the reader assembles the horror ahead of the characters.",
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
    id: "h-g-wells",
    name: "H. G. Wells",
    lived: "1866–1946",
    nationality: "English",
    bio: "The son of a shopkeeper and a lady's maid, Wells escaped a draper's apprenticeship by winning a scholarship to study biology under T. H. Huxley. That training runs through everything he wrote. He spent his later decades as a public intellectual arguing for world government, and lived to see the atomic bomb he had described in 1914.",
    style: "One impossible premise introduced with a straight face, then followed with complete logical honesty wherever it leads — usually somewhere unflattering about people.",
    portrait: {
      src: "/authors/h-g-wells.jpg",
      credit: "George Charles Beresford, c. 1920",
    },
    works: [
      { title: "The War of the Worlds", year: "1898", note: "Martians land in Surrey. The invasion is defeated by something nobody planned.", hue: 6, genres: ["Science Fiction"], chapters: 27 },
      { title: "The Invisible Man", year: "1897", note: "A scientist achieves invisibility and discovers it is nearly useless and impossible to reverse.", hue: 186, genres: ["Science Fiction"], chapters: 28 },
      { title: "The Island of Doctor Moreau", year: "1896", note: "Vivisection on a Pacific island, and animals taught to recite the Law.", hue: 120, genres: ["Science Fiction", "Horror"], chapters: 22 },
      { title: "The First Men in the Moon", year: "1901", note: "An anti-gravity sphere, a lunar civilisation, and a very English pair of explorers.", hue: 236, genres: ["Science Fiction", "Adventure"], chapters: 25 },
      { title: "The Food of the Gods", year: "1904", note: "A growth compound escapes the laboratory and produces giant wasps, then giant children.", hue: 76, genres: ["Science Fiction", "Satire"] },
      { title: "The History of Mr Polly", year: "1910", note: "No science at all: a miserable shopkeeper burns down his shop and walks away happy.", hue: 40, genres: ["Satire"] },
    ],
    stories: [
      { title: "The Country of the Blind", year: "1904", note: "A mountaineer falls into a valley where nobody has eyes, and learns his advantage is a defect.", hue: 148, genres: ["Science Fiction", "Philosophical"] },
      { title: "The Door in the Wall", year: "1906", note: "A green door a boy once walked through, and a successful man who keeps failing to find it again.", hue: 138, genres: ["Philosophical", "Fable"] },
      { title: "The Star", year: "1897", note: "A body enters the solar system and the whole planet watches to see whether it will be hit.", hue: 214, genres: ["Science Fiction"] },
      { title: "The Crystal Egg", year: "1897", note: "A junk-shop owner discovers his glass egg is a window onto Mars, which is looking back.", hue: 194, genres: ["Science Fiction"] },
      { title: "The Red Room", year: "1896", note: "A confident young man agrees to sit up alone in the haunted chamber. Fear arrives anyway.", hue: 358, genres: ["Ghost Story", "Horror"] },
      { title: "The Land Ironclads", year: "1903", note: "Armoured fighting vehicles cross the trenches, described twelve years before the tank existed.", hue: 62, genres: ["Science Fiction"] },
    ],
  },
  {
    id: "charlotte-bronte",
    name: "Charlotte Brontë",
    lived: "1816–1855",
    nationality: "English",
    bio: "The eldest surviving of the Brontë children, raised in a Haworth parsonage on the edge of the moors after losing her mother and two elder sisters early. She worked as a teacher and governess, both of which she disliked, and published as Currer Bell to be read without condescension. She outlived every one of her siblings and died at thirty-eight, pregnant, nine months into a marriage.",
    style: "First person that argues with the reader directly, and heroines whose plainness is stated as fact and then made irrelevant.",
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
    bio: "Born Józef Teodor Konrad Korzeniowski in Russian-ruled Ukraine to Polish patriot parents, orphaned by eleven, and at sea by seventeen. He spent twenty years in the French and British merchant marine, commanding a steamer up the Congo in 1890 — a journey that wrecked his health and supplied his most famous book. He did not speak fluent English until his twenties, and wrote in it anyway.",
    style: "Late, deliberate, and suspicious of plain accounts: a narrator recalling a story he heard from someone who may not have understood it either.",
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
    id: "henry-james",
    name: "Henry James",
    lived: "1843–1916",
    nationality: "American-British",
    bio: "Born in New York to a wealthy, restless, intellectual family and educated across Europe almost at random. He settled permanently in England and made the collision between American innocence and European experience his lifelong subject. He became a British subject in 1915, in protest at American neutrality, a year before his death.",
    style: "Sentences that qualify themselves twice before finishing, in service of registering exactly how much a character has just failed to say.",
    portrait: {
      src: "/authors/henry-james.jpg",
      credit: "John Singer Sargent, 1913",
    },
    works: [
      { title: "The Portrait of a Lady", year: "1881", note: "An American heiress with every option available chooses the worst one for interesting reasons.", hue: 36, genres: ["Romance", "Tragedy"], chapters: 55 },
      { title: "The Wings of the Dove", year: "1902", note: "Two lovers without money and a dying heiress with a great deal of it.", hue: 268, genres: ["Romance", "Tragedy"] },
      { title: "The Ambassadors", year: "1903", note: "A middle-aged man sent to Paris to retrieve a young one, and thoroughly disarmed by it.", hue: 196, genres: ["Modernism", "Romance"] },
      { title: "The Golden Bowl", year: "1904", note: "A father and daughter, their two spouses, and an adultery nobody will name aloud.", hue: 46, genres: ["Modernism", "Tragedy"] },
      { title: "Washington Square", year: "1880", note: "A plain heiress, a charming suitor, and a father who is cruel and also correct.", hue: 104, genres: ["Romance", "Tragedy"], chapters: 35 },
    ],
    stories: [
      { title: "Daisy Miller", year: "1878", note: "A young American in Rome refuses to observe rules she considers absurd. Rome disagrees, fatally.", hue: 322, genres: ["Novella", "Tragedy"] },
      { title: "The Beast in the Jungle", year: "1903", note: "A man waits his whole life for the extraordinary thing destined to happen to him.", hue: 84, genres: ["Philosophical", "Tragedy"] },
      { title: "The Aspern Papers", year: "1888", note: "A critic rents rooms in a Venetian palazzo to get at a dead poet's letters, by any means.", hue: 40, genres: ["Novella", "Mystery"] },
      { title: "The Jolly Corner", year: "1908", note: "A man returns to New York after thirty years and stalks the empty house for the self he would have been.", hue: 276, genres: ["Ghost Story", "Philosophical"] },
      { title: "The Real Thing", year: "1892", note: "A genuine gentleman and lady model for an illustrator and turn out to be useless at looking real.", hue: 128, genres: ["Satire"] },
      { title: "The Figure in the Carpet", year: "1896", note: "A critic hunts the hidden pattern in a novelist's work; everyone who learns it dies before telling.", hue: 212, genres: ["Mystery", "Satire"] },
    ],
  },
  {
    id: "emily-bronte",
    name: "Emily Brontë",
    lived: "1818–1848",
    nationality: "English",
    bio: "The most private of the Brontë siblings, happiest at Haworth and miserable away from it — she lasted three months at school and a few more as a teacher. She wrote poetry in secret for years; Charlotte's discovery of the notebooks led to the sisters' first publication. She caught cold at her brother's funeral, refused a doctor, and died three months later at thirty.",
    style: "No moralising narrator and no reassurance. A structure of nested tellers that keeps the reader at arm's length from people it would be unwise to get near.",
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
];

export const authorById = (id: string) => authors.find((a) => a.id === id);
export const authorByName = (name: string) =>
  authors.find((a) => a.id === authorSlug(name));
