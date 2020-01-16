import {NodeMetadata} from "./node-metadata";

export class NetworkMetadata {
  'public-key': string;
  nodes: NodeMetadata[];
  nodeIndex: number;
}
