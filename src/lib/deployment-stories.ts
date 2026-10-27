export type DeploymentStoryCmsRow = {
  deployment_id: string;
  headline: string | null;
  narrative: string | null;
  image_slug: string | null;
  cover_image_url: string | null;
  featured: boolean;
  updated_at: string;
};

export type DeploymentStoryCmsInput = {
  deployment_id: string;
  headline?: string | null;
  narrative?: string | null;
  image_slug?: string | null;
  cover_image_url?: string | null;
  featured?: boolean;
};
