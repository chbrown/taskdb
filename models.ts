// import only types from http-respond
import {ReactType, Payload} from 'http-respond';

export interface RouteRequest {
  query?: any;
  body?: any;
  params?: any;
  method?: string;
  pathname?: string;
}
export interface Route {
  url: string;
  method: string;
  description?: string;
  handler: (req: RouteRequest) => Promise<Payload<any>> | Payload<any>;
}

/** task_type database record */
export interface TaskType {
  id?: number;
  name: string;
  schema: any;
  template_type: string;
  template: string;
  created?: string;
}

/** task database record */
export interface Task {
  id?: number;
  task_type_id: number;
  context?: any;
  priority?: number;
  available?: string;
  worker_id?: number;
  started?: string;
  completed?: string;
  result?: any;
  created?: string;
  /** provided by api.getTask */
  compiledTemplate?: string;
}

/** worker database record */
export interface Worker {
  id?: number;
  name: string;
  email: string;
  salt: string;
  password: string;
  administrator?: boolean;
  created?: string;
}
