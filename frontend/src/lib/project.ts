export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  service?: string | null;   // tjänstens slug (admin → Tjänster)
}

export interface DetailedProject {
  id: string;
  title: string;
  description: string;
  images: string[];
  service?: string | null;
}

export interface CreateProjectRequest {
  title:            string;
  description:      string;
  mainImage:        string;
  additionalImages: string[];
  service?:         string | null;
}

export interface UpdateProjectRequest {
  title?:            string;
  description?:      string;
  mainImage?:        string;
  additionalImages?: string[];
  service?:          string | null;
}