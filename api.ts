import {createReadStream} from 'fs';
import {join} from 'path';
import * as pg from 'pg';
import {Connection} from 'sqlcmd-pg';
import {createHash, randomBytes} from 'crypto';

const babel = require('babel-core');

import {TaskType, Task, Worker} from './models';

const identity: <T>(t: T) => T = (value) => value;
pg['types'].setTypeParser(1082, identity); // DATE
pg['types'].setTypeParser(1114, identity); // TIMESTAMP
pg['types'].setTypeParser(1184, identity); // TIMESTAMPTZ
pg['types'].setTypeParser(1182, identity); // DATE[]
export const db = new Connection({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  database: 'taskdb',
});


db.on('log', ev => {
  if (ev.level !== 'debug') {
    console.log(ev.format, ...ev.args, ev.level);
  }
});

function hashPassword(password: string, salt: string): string {
  const shasum = createHash('sha256');
  shasum.update(password)
  shasum.update(salt);
  return shasum.digest('hex');
}

const babelOptions = {
  highlightCode: false,
  presets: ["es2015", "stage-1", "stage-2", "react"],
};

const _cached_templates: {[index: string]: string} = {};
function compileTemplate(template: string, template_type: string): string {
  let cached_template = _cached_templates[template];
  if (cached_template === undefined) {
    if (template_type === 'react' || true) {
      console.log('transforming template:', template);
      const {code}: {code: string, map: any, ast: any} = babel.transform(template, babelOptions);
      console.log('...into code:', code);
      cached_template = _cached_templates[template] = code;
    }
    else {
      throw new Error(`Unrecognized template type: ${template_type}`);
    }
  }
  return cached_template;
}

const api = {
  readFile({path}: {path: string}) {
    const filepath = join(__dirname, path);
    return createReadStream(filepath);
  },
  // task_type
  getTaskType({id}: {id: number}): Promise<TaskType> {
    return db.SelectOne('task_type').whereEqual({id}).executePromise();
  },
  getTaskTypes({limit = 100}: {limit?: number} = {}): Promise<TaskType[]> {
    return db.Select('task_type').orderBy('id ASC').limit(limit).executePromise();
  },
  insertTaskType(taskType: TaskType): Promise<TaskType> {
    return db.InsertOne('task_type')
    .set(taskType)
    .returning('*')
    .executePromise();
  },
  updateTaskType(taskType: TaskType): Promise<TaskType> {
    const {id, name, template, template_type, schema} = taskType;
    return db.UpdateOne('task_type')
    .setEqual({
      name,
      template,
      template_type,
      schema: JSON.stringify(taskType.schema),
    })
    .whereEqual({id})
    .returning('*')
    .executePromise();
  },
  // worker
  getWorker({id}: {id: number}): Promise<Worker> {
    return db.SelectOne('worker').whereEqual({id}).executePromise();
  },
  getWorkers({limit = 100}: {limit?: number} = {}): Promise<Worker[]> {
    return db.Select('worker').orderBy('id ASC').limit(limit).executePromise();
  },
  insertWorker({name, email, password: rawPassword}: {name: string, email: string, password: string}): Promise<Worker> {
    const salt = randomBytes(128).toString('hex');
    const password = hashPassword(rawPassword, salt);

    return db.InsertOne('worker')
    .set({name, email, password, salt})
    .returning('*')
    .executePromise();
  },
  updateWorker({id, name, email, password: rawPassword}: {id: number, name: string, email: string, password: string}): Promise<Worker> {
    const salt = randomBytes(128).toString('hex');
    const password = hashPassword(rawPassword, salt);

    return db.UpdateOne('worker')
    .setEqual({name, email, password, salt})
    .whereEqual({id})
    .returning('*')
    .executePromise();
  },
  // task
  getTask({id}: {id: number}): Promise<Task> {
    return db.SelectOne('task INNER JOIN task_type ON task_type.id = task.task_type_id')
    .add('task.*', 'task_type.name', 'task_type.schema',
      'task_type.template_type', 'task_type.template')
    .whereEqual({'task.id': id})
    .executePromise().then(task => {
      const compiledTemplate = compileTemplate(task.template, task.template_type);
      return Object.assign(task, {compiledTemplate});
    });
  },
  getTasks({limit = 100}: {limit?: number} = {}): Promise<Task[]> {
    return db.Select('task').orderBy('id ASC').limit(limit).executePromise();
  },
  nextTasks({limit = 10}: {limit?: number} = {}): Promise<Task[]> {
    return db.Select('task INNER JOIN task_type ON task_type.id = task.task_type_id')
    .add('task.*', 'task_type.name', 'task_type.schema',
      'task_type.template_type', 'task_type.template')
    .where('completed IS NULL')
    .where('available < NOW()')
    .orderBy('priority DESC')
    .limit(limit)
    .executePromise().then(tasks => {
      return tasks.map(task => {
        const compiledTemplate = compileTemplate(task.template, task.template_type);
        return Object.assign(task, {compiledTemplate});
      });
    });
  },
  reserveTasks(tasks: Task[]) {
    const available = new Date(new Date().getTime() + 15*60*1000); // 15 minutes from now
    return db.Update('task')
    .setEqual({available})
    .where('id = ANY(?)', tasks.map(task => task.id))
    .executePromise();
  },
  insertTask({task_type_id, context, priority}: Task): Promise<Task> {
    return db.InsertOne('task')
    .set({
      task_type_id,
      context: JSON.stringify(context),
      priority,
    })
    .returning('*')
    .executePromise();
  },
  updateTask({id, task_type_id, context, priority,
      available, worker_id, started, completed, result}: Task): Promise<Task> {
    return db.UpdateOne('task')
    .setEqual({
      task_type_id,
      context: JSON.stringify(context),
      priority,
      worker_id,
      started,
      completed,
      result: JSON.stringify(result),
    })
    .whereEqual({id})
    .returning('*')
    .executePromise();
  },
};

export default api;
