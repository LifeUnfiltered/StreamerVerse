import { MovieDb } from 'moviedb-promise';
import type { Video } from '@shared/schema';

const tmdb = new MovieDb(process.env.TMDB_API_KEY!);

export const TEST_TV_SHOWS: Video[] = [
  {
    id: 0,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones',
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947'
    },
    chapters: null
  },
  {
    id: 1,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead',
    description: 'Sheriff Deputy Rick Grimes wakes up from a coma to learn the world is in ruins and must lead a group of survivors to stay alive.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211'
    },
    chapters: null
  },
  {
    id: 2,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student to secure his family\'s financial future as he battles terminal lung cancer.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747'
    },
    chapters: null
  },
  {
    id: 3,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things',
    description: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334'
    },
    chapters: null
  },
  {
    id: 4,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian',
    description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088'
    },
    chapters: null
  },
  {
    id: 5,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost',
    description: 'The survivors of a plane crash are forced to work together in order to survive on a seemingly deserted tropical island.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008'
    },
    chapters: null
  },
  {
    id: 6,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office',
    description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676'
    },
    chapters: null
  },
  {
    id: 7,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul',
    description: 'The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476'
    },
    chapters: null
  }
];

// Test episodes with multiple seasons
export const TEST_EPISODES: Video[] = [
  // Game of Thrones Season 1
  {
    id: 3,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E1 - Winter Is Coming',
    description: 'Eddard Stark is torn between his family and an old friend when asked to serve at the side of King Robert Baratheon.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 4,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E2 - The Kingsroad',
    description: 'While Bran recovers from his fall, Ned takes only his daughters to Kings Landing. Jon Snow goes with his uncle Benjen to The Wall.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 5,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E3 - Lord Snow',
    description: 'Lord Stark and his daughters arrive at King\'s Landing to take up his new duties as the King\'s Hand.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 6,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E4 - Cripples, Bastards, and Broken Things',
    description: 'Ned investigates Jon Arryn\'s murder. Jon befriends Samwell Tarly, a coward who has been forced to join the Night\'s Watch.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 7,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E5 - The Wolf and the Lion',
    description: 'Catelyn arrests Tyrion for trying to kill Bran. Ned confronts Cersei about the secrets that Jon Arryn died for.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 8,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E6 - A Golden Crown',
    description: 'While recovering from his battle with Jaime, Ned is forced to run the kingdom while Robert goes hunting.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 9,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E7 - You Win or You Die',
    description: 'Robert has been injured while hunting and is dying. Jon and the others find evidence that proves Mormont\'s report.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  {
    id: 10,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E8 - The Pointy End',
    description: 'The Lannisters press their advantage over the Starks; Robb rallies his father\'s northern allies and heads south to war.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-8',
      season: 1,
      episode: 8
    },
    chapters: null
  },
  // Game of Thrones Season 2
  {
    id: 11,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E1 - The North Remembers',
    description: 'As Robb Stark and his northern army continue the war against the Lannisters, Tyrion arrives in King\'s Landing to counsel Joffrey.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-1',
      season: 2,
      episode: 1
    },
    chapters: null
  },
  {
    id: 12,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E2 - The Night Lands',
    description: 'Arya makes friends with Gendry. Tyrion tries to take control of the Small Council.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-2',
      season: 2,
      episode: 2
    },
    chapters: null
  },
  {
    id: 13,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E3 - What Is Dead May Never Die',
    description: 'Tyrion tests the loyalty of the small council. Catelyn tries to rally support for the Starks.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-3',
      season: 2,
      episode: 3
    },
    chapters: null
  },
  {
    id: 14,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E4 - Garden of Bones',
    description: 'Joffrey punishes Sansa for Robb\'s victories, and Tyrion scrambles to temper the king\'s cruelty.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-4',
      season: 2,
      episode: 4
    },
    chapters: null
  },
  {
    id: 15,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E5 - The Ghost of Harrenhal',
    description: 'Arya and Gendry encounter a new threat. Tyrion seeks to solidify his position in King\'s Landing.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-5',
      season: 2,
      episode: 5
    },
    chapters: null
  },
  {
    id: 16,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E6 - The Old Gods and the New',
    description: 'Bran and Rickard Karstark explore the mysteries of the past. Theon plots against the Starks.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-6',
      season: 2,
      episode: 6
    },
    chapters: null
  },
  {
    id: 17,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E7 - A Man Without Honor',
    description: 'Theon confronts his father. Tyrion seeks an alliance, and the war against the Lannisters continues.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-7',
      season: 2,
      episode: 7
    },
    chapters: null
  },
  {
    id: 18,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E8 - Blackwater',
    description: 'Stannis Baratheon attacks King\'s Landing.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-8',
      season: 2,
      episode: 8
    },
    chapters: null
  },
  {
    id: 19,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E9 - The Rains of Castamere',
    description: 'The Red Wedding.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-9',
      season: 2,
      episode: 9
    },
    chapters: null
  },
  {
    id: 20,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E10 - Valar Morghulis',
    description: 'The season finale.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-10',
      season: 2,
      episode: 10
    },
    chapters: null
  },
  // The Walking Dead Season 1
  {
    id: 21,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E1 - Days Gone Bye',
    description: 'Rick searches for his family in a world terrorized by the walking dead.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 22,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E2 - Guts',
    description: 'Rick finds himself trapped in Atlanta, where he bands together with a group of survivors to escape the city.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 23,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E3 - Tell It to the Frogs',
    description: 'Rick reunites with his family but has to decide whether to risk his life to help a group of survivors trapped in Atlanta.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 24,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E4 - Vatos',
    description: 'Rick, Glenn, Daryl and T-Dog encounter a group of survivors in Atlanta who appear to be a threat.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 25,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E5 - Wildfire',
    description: 'The group discovers the source of the mysterious fire and encounters another threat.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 26,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E6 - Ts',
    description: 'The group struggles to survive as their numbers dwindle and they face a new threat.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 27,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E7 - The Infected',
    description: 'The group finds themselves trapped and must work together to escape.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  {
    id: 28,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E8 - Sacrifice',
    description: 'The group makes a sacrifice to save themselves.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-8',
      season: 1,
      episode: 8
    },
    chapters: null
  },
  // The Walking Dead Season 2
  {
    id: 29,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E1 - What Lies Ahead',
    description: 'The group sets out for Fort Benning but encounters a threat on the highway the likes of which they\'ve never seen.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-1',
      season: 2,
      episode: 1
    },
    chapters: null
  },
  {
    id: 30,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E2 - Bloodletting',
    description: 'After a tragic accident, the group finds shelter at a nearby farm while searching for a missing person.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-2',
      season: 2,
      episode: 2
    },
    chapters: null
  },
  {
    id: 31,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E3 - Save the Last One',
    description: 'The group awaits Shane\'s return as he searches for medical supplies.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-3',
      season: 2,
      episode: 3
    },
    chapters: null
  },
  {
    id: 32,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E4 - Cherokee Rose',
    description: 'The group mourns a loss and searches for answers.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-4',
      season: 2,
      episode: 4
    },
    chapters: null
  },
  {
    id: 33,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E5 - Chupacabra',
    description: 'The group encounters a new threat.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-5',
      season: 2,
      episode: 5
    },
    chapters: null
  },
  {
    id: 34,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E6 - Secrets',
    description: 'Secrets are revealed.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-6',
      season: 2,
      episode: 6
    },
    chapters: null
  },
  {
    id: 35,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E7 - Pretty Much Dead Already',
    description: 'The group faces a difficult decision.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-7',
      season: 2,
      episode: 7
    },
    chapters: null
  },
  {
    id: 36,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E8 - Nebraska',
    description: 'The group travels to Nebraska in search of supplies.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-8',
      season: 2,
      episode: 8
    },
    chapters: null
  },
  // Breaking Bad Season 1
  {
    id: 37,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad S1E1 - Pilot',
    description: 'Walter White, a struggling high school chemistry teacher, is diagnosed with advanced lung cancer. He turns to a life of crime, producing and selling methamphetamine.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 38,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad S1E2 - Cat\'s in the Bag...',
    description: 'Walt and Jesse must deal with the aftermath of their first drug deal gone wrong.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 39,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad S1E3 - ...And the Bag\'s in the River',
    description: 'Walt and Jesse clean up the mess they\'ve made.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 40,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad S1E4 - Cancer Man',
    description: 'Walt struggles to balance his new life with his family life.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 41,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad S1E5 - Gray Matter',
    description: 'Walt reflects on his past and his current situation.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 42,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad S1E6 - Crazy Handful of Nothin\'',
    description: 'Walt and Jesse encounter a new challenge.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 43,
    sourceId: 'tt0903747',
    source: 'vidsrc',
    title: 'Breaking Bad S1E7 - A No-Rough-Stuff-Type Deal',
    description: 'Walt and Jesse try to keep a low profile.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    metadata: {
      imdbId: 'tt0903747',
      type: 'tv',
      tmdbId: 1396,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0903747/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  // Stranger Things Season 1
  {
    id: 44,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E1 - Chapter One: The Vanishing of Will Byers',
    description: 'On his way home from a friend\'s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 45,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E2 - Chapter Two: The Weirdo on Maple Street',
    description: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 46,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E3 - Chapter Three: Holly, Jolly',
    description: 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan\'s been up to. Joyce is convinced Will is trying to talk to her.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 47,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E4 - Chapter Four: The Body',
    description: 'The search for Will intensifies as the town grapples with a tragic loss.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 48,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E5 - Chapter Five: The Flea and the Acrobat',
    description: 'Eleven\'s past is revealed, and the group gets closer to finding Will.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 49,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E6 - Chapter Six: The Monster',
    description: 'The group confronts the monster in the Upside Down.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 50,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E7 - Chapter Seven: The Bathtub',
    description: 'Eleven uses her powers to help the group.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  {
    id: 51,
    sourceId: 'tt4574334',
    source: 'vidsrc',
    title: 'Stranger Things S1E8 - Chapter Eight: The Upside Down',
    description: 'The final confrontation with the monster.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    metadata: {
      imdbId: 'tt4574334',
      type: 'tv',
      tmdbId: 66732,
      embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/1-8',
      season: 1,
      episode: 8
    },
    chapters: null
  },
  // The Mandalorian Season 1
  {
    id: 52,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E1 - Chapter 1: The Mandalorian',
    description: 'A Mandalorian bounty hunter tracks a target for a well-paying client.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 53,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E2 - Chapter 2: The Child',
    description: 'Target in hand, the Mandalorian must now contend with scavengers.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 54,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E3 - Chapter 3: The Sin',
    description: 'The battered Mandalorian returns to his client for reward.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 55,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E4 - Chapter 4: Sanctuary',
    description: 'The Mandalorian seeks refuge on a remote planet.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 56,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E5 - Chapter 5: The Gunslinger',
    description: 'The Mandalorian crosses paths with a gunslinger.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 57,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E6 - Chapter 6: The Prisoner',
    description: 'The Mandalorian takes on a new mission.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 58,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E7 - Chapter 7: The Reckoning',
    description: 'The Mandalorian faces a reckoning.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  {
    id: 59,
    sourceId: 'tt8111088',
    source: 'vidsrc',
    title: 'The Mandalorian S1E8 - Chapter 8: Redemption',
    description: 'The Mandalorian seeks redemption.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    metadata: {
      imdbId: 'tt8111088',
      type: 'tv',
      tmdbId: 82856,
      embedUrl: 'https://vidsrc.to/embed/tv/tt8111088/1-8',
      season: 1,
      episode: 8
    },
    chapters: null
  },
  // Lost Season 1
  {
    id: 60,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E1 - Pilot Part 1',
    description: 'Forty-eight survivors of an airline crash land in the Pacific Ocean.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 61,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E2 - Pilot Part 2',
    description: 'Having discovered a transceiver among the plane\'s wreckage, the survivors attempt to broadcast a signal.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 62,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E3 - Tabula Rasa',
    description: 'Jack tries to perform surgery on a wounded passenger while Locke discovers a mysterious hatch.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 63,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E4 - Walkabout',
    description: 'Locke struggles with his past while Kate helps a mysterious figure.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 64,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E5 - White Rabbit',
    description: 'Jack faces his past while Locke explores the island.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 65,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E6 - House of the Rising Sun',
    description: 'The survivors discover a hidden bunker.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 66,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E7 - The Moth',
    description: 'Kate and Sawyer work together while Jack struggles with his demons.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  {
    id: 67,
    sourceId: 'tt0411008',
    source: 'vidsrc',
    title: 'Lost S1E8 - Confidence Man',
    description: 'Sawyer\'s past is revealed.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/og6S0aTZU6YUJAbqxeKjCa3kY1E.jpg',
    metadata: {
      imdbId: 'tt0411008',
      type: 'tv',
      tmdbId: 4607,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0411008/1-8',
      season: 1,
      episode: 8
    },
    chapters: null
  },
  // The Office Season 1
  {
    id: 70,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E1 - Pilot',
    description: 'The premiere episode introduces the boss and staff of the Scranton branch of paper distributor Dunder Mifflin.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 71,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E2 - Diversity Day',
    description: 'Michael\'s off-color remark puts a sensitivity trainer in the office for a presentation.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 72,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E3 - Health Care',
    description: 'Michael tries to convince his employees to get health insurance.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 73,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E4 - The Alliance',
    description: 'Jim and Pam form an unlikely alliance.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 74,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E5 - Basketball',
    description: 'Michael organizes a basketball game between the office staff.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 75,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E6 - Hot Girl',
    description: 'Michael is smitten with a new employee.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 76,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E7 - The Fire',
    description: 'A fire drill turns into a chaotic situation.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  {
    id: 77,
    sourceId: 'tt0386676',
    source: 'vidsrc',
    title: 'The Office S1E8 - Halloween',
    description: 'Michael\'s Halloween party brings out the worst in everyone.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/5uwJHXp8MPvwxv8VkfYM6pEsY3g.jpg',
    metadata: {
      imdbId: 'tt0386676',
      type: 'tv',
      tmdbId: 2316,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0386676/1-8',
      season: 1,
      episode: 8
    },
    chapters: null
  },
  // Better Call Saul Season 1
  {
    id: 80,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E1 - Uno',
    description: 'Jimmy McGill is struggling to make ends meet as a public defender in Albuquerque.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-1',
      season: 1,
      episode: 1
    },
    chapters: null
  },
  {
    id: 81,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E2 - Mijo',
    description: 'Jimmy must prove his worth to a dangerous potential client.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-2',
      season: 1,
      episode: 2
    },
    chapters: null
  },
  {
    id: 82,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E3 - Nacho',
    description: 'Jimmy gets involved in a dangerous situation.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-3',
      season: 1,
      episode: 3
    },
    chapters: null
  },
  {
    id: 83,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E4 - Hero',
    description: 'Jimmy tries to help someone in need.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-4',
      season: 1,
      episode: 4
    },
    chapters: null
  },
  {
    id: 84,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E5 - Five-O',
    description: 'Jimmy and Mike work together on a case.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-5',
      season: 1,
      episode: 5
    },
    chapters: null
  },
  {
    id: 85,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E6 - Bingo',
    description: 'Jimmy and Kim work together on a case.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-6',
      season: 1,
      episode: 6
    },
    chapters: null
  },
  {
    id: 86,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E7 - Pimento',
    description: 'Jimmy and Kim face a challenge.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-7',
      season: 1,
      episode: 7
    },
    chapters: null
  },
  {
    id: 87,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E8 - Rico',
    description: 'Jimmy and Mike face a dangerous situation.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-8',
      season: 1,
      episode: 8
    },
    chapters: null
  },
  {
    id: 88,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E9 - ...And the Bag\'s in the River',
    description: 'Jimmy and Kim face the consequences of their actions.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-9',
      season: 1,
      episode: 9
    },
    chapters: null
  },
  {
    id: 89,
    sourceId: 'tt3032476',
    source: 'vidsrc',
    title: 'Better Call Saul S1E10 - Marco',
    description: 'The season finale.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b6Qy.jpg',
    metadata: {
      imdbId: 'tt3032476',
      type: 'tv',
      tmdbId: 60059,
      embedUrl: 'https://vidsrc.to/embed/tv/tt3032476/1-10',
      season: 1,
      episode: 10
    },
    chapters: null
  }
];

// Convert TMDB movie to our Video type
function movieToVideo(movie: any): Video {
  return {
    id: 0,
    sourceId: movie.imdb_id || `tmdb-${movie.id}`,
    source: 'vidsrc',
    title: movie.title,
    description: movie.overview || null,
    thumbnail: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    metadata: {
      imdbId: movie.imdb_id,
      type: 'movie',
      tmdbId: movie.id,
      embedUrl: movie.imdb_id ? `https://vidsrc.to/embed/movie/${movie.imdb_id}` : null
    },
    chapters: null
  };
}

// Convert TMDB TV show to our Video type
function tvShowToVideo(show: any, episode?: any): Video | null {
  try {
    const imdbId = show.external_ids?.imdb_id;
    if (!imdbId || !show.name) {
      console.log('Skipping show - missing data:', {
        name: show?.name,
        imdbId,
        showId: show?.id
      });
      return null;
    }

    // Use the exact URL format from VidSrc documentation
    let embedUrl: string;
    let title: string;
    let description: string;

    if (episode) {
      // Format: https://vidsrc.to/embed/tv/tt0944947/1-1
      title = `${show.name} S${episode.season_number}E${episode.episode_number} - ${episode.name}`;
      description = episode.overview || show.overview || '';
      embedUrl = `https://vidsrc.to/embed/tv/${imdbId}/${episode.season_number}-${episode.episode_number}`;
    } else {
      // Format: https://vidsrc.to/embed/tv/tt0944947
      title = show.name;
      description = show.overview || '';
      embedUrl = `https://vidsrc.to/embed/tv/${imdbId}`;
    }

    console.log('Creating TV video:', {
      title,
      imdbId,
      embedUrl,
      isEpisode: !!episode
    });

    return {
      id: 0,
      sourceId: imdbId,
      source: 'vidsrc',
      title,
      description,
      thumbnail: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
      metadata: {
        imdbId,
        type: 'tv',
        tmdbId: show.id,
        embedUrl,
        season: episode?.season_number,
        episode: episode?.episode_number
      },
      chapters: []
    };
  } catch (error) {
    console.error('Error creating TV video:', error);
    return null;
  }
}

// Search for movies and TV shows
export async function searchContent(query: string): Promise<Video[]> {
  try {
    const results = await tmdb.searchMulti({ query });
    const videos: Video[] = [];

    for (const result of results.results || []) {
      try {
        if (result.media_type === 'movie') {
          const movieDetails = await tmdb.movieInfo({
            id: result.id,
            append_to_response: 'external_ids'
          });
          if (movieDetails.imdb_id) {
            videos.push(movieToVideo(movieDetails));
          }
        }
      } catch (error) {
        console.error('Error processing search result:', error);
        continue;
      }
    }

    // Add test TV shows if query matches any of their titles
    const lowerQuery = query.toLowerCase();
    TEST_TV_SHOWS.forEach(show => {
      if (show.title.toLowerCase().includes(lowerQuery)) {
        videos.push(show);
      }
    });

    return videos;
  } catch (error) {
    console.error('TMDB search error:', error);
    return [];
  }
}

// Fetch latest movies
export async function fetchLatestMovies(): Promise<Video[]> {
  try {
    const nowPlaying = await tmdb.movieNowPlaying();
    const videos: Video[] = [];

    for (const movie of nowPlaying.results || []) {
      try {
        const movieDetails = await tmdb.movieInfo({
          id: movie.id,
          append_to_response: 'external_ids'
        });
        if (movieDetails.imdb_id) {
          videos.push(movieToVideo(movieDetails));
        }
      } catch (error) {
        console.error('Error processing movie:', error);
        continue;
      }
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest movies error:', error);
    return [];
  }
}

// Fetch latest TV shows - using test data for now
export async function fetchLatestTVShows(): Promise<Video[]> {
  console.log('Returning test TV shows data');
  return TEST_TV_SHOWS;
}

// Fetch latest episodes - using test data for now
export async function fetchLatestEpisodes(): Promise<Video[]> {
  console.log('Returning test episodes data');
  return TEST_EPISODES;
}