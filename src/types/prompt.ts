export interface PromptDesign {
  Theme: string;
  PrimaryColor: string;
  SecondaryColor: string;
}

export interface PromptJson {
  Name: string;
  type: string;
  Design: PromptDesign;
  Background: string;
}


