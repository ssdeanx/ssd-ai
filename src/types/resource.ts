export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  blob?: string; // base64 encoded
}

export interface ReadResourceResult {
  contents: ResourceContent[];
}
