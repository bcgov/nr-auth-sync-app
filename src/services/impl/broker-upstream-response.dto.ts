export interface GraphDataResponseEdgeDto {
  id: string;
  is: number;
  it: number;
  name: string;
  prop?: any;
  source: string;
  target: string;
}

export interface VertexPointerDto {
  vertex: string;
}

export interface UserDto extends VertexPointerDto {
  _id: string;
  domain: string;
  email: string;
  guid: string;
  name: string;
  username: string;
}

export interface UpstreamResponseDto {
  collection: UserDto;
  path: GraphDataResponseEdgeDto;
}
