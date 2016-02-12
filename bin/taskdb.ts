#!/usr/bin/env node --use_strict --harmony_default_parameters --harmony_destructuring --harmony_rest_parameters
import {join} from 'path';
import {logger, Level} from 'loge';
import {Parser, Stringifier} from 'streaming/json';
import {Transformer} from 'streaming/transformer';
import * as request from 'request';
import * as yargs from 'yargs';

import {executePatches} from 'sql-patch';

import api, {db} from '../api';
import {defaultPort, defaultHostname, start} from '../server';

interface Command {
  id: string;
  description: string;
  options: {[key: string]: yargs.Options},
  run: (argv: any) => Promise<any>;
}

const commands: Command[] = [
  {
    id: 'load-tasks',
    description: 'Load tasks from /dev/stdin',
    options: {
      task_type_id: {
        type: 'number',
        description: 'The task type ID to use',
        required: true,
      },
      priority: {
        type: 'number',
        description: 'The priority level to use',
      },
      // < articles.json
    },
    run(argv: any) {
      const task_prototype = argv;
      delete task_prototype['_'];
      delete task_prototype['$0'];

      console.error('Using task fields from command line: %@', task_prototype);

      const url = `http://${defaultHostname}:${defaultPort}/tasks`;

      // 1. parser
      const parser = new Parser();
      parser.on('error', err => {
        console.error('Failed to parse JSON input: %s', err.stack);
      });

      // 2. transform
      const transformer = new Transformer((chunk, encoding, callback) => {
        const task = Object.assign({context: chunk}, task_prototype);
        request.post({url: url, json: task}, (error, response, body) => {
          callback(error, body);
        });
      }, {objectMode: true});
      transformer.on('error', err => {
        console.error('Failed to execute transform function: %s', err);
      });

      // 3. stringifier
      const stringifier = new Stringifier();
      stringifier.on('error', err => {
        console.error('Failed to stringify JSON output: %s', err.stack);
      });

      const stream = process.stdin
        .pipe(parser).pipe(transformer).pipe(stringifier)
        .pipe(process.stdout);
      return new Promise<void>((resolve, reject) => {
        stream.on('finish', resolve);
      });
    }
  },
  {
    id: 'server',
    description: 'Start http server',
    options: {
      port: {
        type: 'number',
        description: 'port to listen on',
        default: defaultPort,
      },
      hostname: {
        type: 'string',
        description: 'hostname to listen on',
        default: defaultHostname,
      },
    },
    run(argv: any) {
      if (argv.verbose) {
        db.on('log', ev => {
          logger[ev.level](ev.format, ...ev.args);
        });
      }

      return new Promise((resolve, reject) => {
        return db.createDatabaseIfNotExists(err => err ? reject(err) : resolve());
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          const patches_dirpath = join(__dirname, '..', 'migrations');
          executePatches(db, '_migrations', patches_dirpath, err => err ? reject(err) : resolve());
        });
      })
      .then(() => {
        return new Promise<void>((resolve, reject) => {
          start(argv.port, argv.hostname);
        });
      });
    }
  }
];

function main() {
  var argvparser = yargs
  .usage('Usage: taskdb <command> [options]')
  .options({
    help: {
      alias: 'h',
      description: 'print this help message',
      type: 'boolean',
    },
    verbose: {
      alias: 'v',
      description: 'print extra output',
      type: 'boolean',
    },
    version: {
      description: 'print version',
      type: 'boolean',
    },
  });

  commands.forEach(command => {
    argvparser = argvparser.command(command.id, command.description);
  });

  var argv = argvparser.argv;
  logger.level = argv.verbose ? Level.debug : Level.info;

  const command_id: string = argvparser.argv._[0];
  const command = commands.find(command => command.id === command_id);
  if (command !== undefined) {
    argvparser = argvparser.options(command.options);
  }

  if (argv.help) {
    argvparser.showHelp();
  }
  else if (argv.version) {
    console.log(require('../package.json').version);
  }
  else {
    // demand an command argument
    argvparser = argvparser.demand(1);
    argv = argvparser.argv;
    if (command === undefined) {
      console.error(`Unrecognized command: "${command_id}"`);
      process.exit(1);
    }
    command.run(argv).then(() => {
      logger.info('DONE');
      process.exit(0);
    }, error => {
      logger.error(`ERROR: ${error.toString()}`);
      process.exit(1);
    });
  }
}

if (require.main === module) {
  main();
}
