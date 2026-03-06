export interface Story {
  id: string;
  title: string;
  teaser: string;
  coverImage: string;
  prompt: string;
  pages: Page[];
}

export interface Page {
  text: string[];
  image: string;
}
