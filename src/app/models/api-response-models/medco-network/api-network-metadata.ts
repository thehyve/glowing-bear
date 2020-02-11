import {ApiNodeMetadata} from './api-node-metadata';

export class ApiNetworkMetadata {
  'public-key': string;
  nodes: ApiNodeMetadata[];
  nodeIndex: number;
}
