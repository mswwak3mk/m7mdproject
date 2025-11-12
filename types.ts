
export interface Profile {
  name: string;
  grade: string;
  photo: string | null;
}

export interface ContentItem {
  id: string;
  text: string;
}

export interface SkillItem extends ContentItem {
  icon: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image?: string | null;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface PortfolioData {
  profile: Profile;
  achievements: ContentItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  subjects: ContentItem[];
  comments: Comment[];
}
