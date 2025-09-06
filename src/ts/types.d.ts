export interface Social {
  label: string;
  url: string;
}
export interface Project {
  name: string;
  description: string;
  link: string;
  image?: string;
}
export interface Experience {
  company: string;
  role: string;
  start: string;
  end: string;
  description: string;
}
export interface Education {
  school: string;
  degree: string;
  start: string;
  end: string;
}
export interface SiteData {
  basics: {
    name: string;
    title: string;
    summary: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    avatar?: string;
    socials: Social[];
  };
  skills: string[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  contact: {
    email: string; // destino del formulario
  };
}
