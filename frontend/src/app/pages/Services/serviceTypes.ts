import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type ServiceItem = {
  icon: IconDefinition;
  key: string;
  featureKeys: string[];
  color: string;
  image: string;
};

export type ServiceFeature = {
  icon: IconDefinition;
  key: string;
};
