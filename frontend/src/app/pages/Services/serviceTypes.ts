import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type ServiceItem = {
  icon: IconDefinition;
  title: string;
  description: string;
  features: string[];
  color: string;
  image: string;
};

export type ServiceFeature = {
  icon: IconDefinition;
  title: string;
  description: string;
};