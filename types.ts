
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

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface PortfolioData {
  profile: Profile;
  achievements: ContentItem[];
  skills: SkillItem[];
  subjects: ContentItem[];
  comments: Comment[];
}
