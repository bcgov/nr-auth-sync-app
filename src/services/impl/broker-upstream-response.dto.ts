
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
  id: string;
  email: string;
  guid: string;
  name: string;
  roles?: string[];
  username: string;
}

export interface UpstreamResponseDto {
  collection: UserDto;
  path: GraphDataResponseEdgeDto;
}
