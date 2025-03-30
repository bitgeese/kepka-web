import { createDirectus, rest, } from '@directus/sdk';

type Kepka = {
  title: string;
  description: string;
}



type Page = {
  title: string;
  content: string;
  slug: string;
}

type Artwork = {
  cover: string;
  title: string;
  description: string;
  date_created: string
  slug: string;
}

type Schema = {
  kepka_artworks: Artwork[];
  kepka: Kepka;
  kepka_pages: Page[];
}

const directus = createDirectus<Schema>('https://cms.fram.dev').with(rest());

export default directus;