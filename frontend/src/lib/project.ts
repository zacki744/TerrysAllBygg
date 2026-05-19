export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface DetailedProject {
  id: string;
  title: string;
  description: string;
  images: string[];
}

export interface CreateProjectRequest {
  title:            string;
  description:      string;
  mainImage:        string;
  additionalImages: string[];
}

export interface UpdateProjectRequest {
  title?:            string;
  description?:      string;
  mainImage?:        string;
  additionalImages?: string[];
}