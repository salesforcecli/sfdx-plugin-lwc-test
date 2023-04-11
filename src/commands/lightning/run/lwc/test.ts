/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {Flags, loglevel, SfCommand} from '@salesforce/sf-plugins-core';
import {Messages} from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sfdx-plugin-lwc-test', 'run');

export type RunResult = {
  message: string;
  jestExitCode: number;
};

export default class RunTest extends SfCommand<RunResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:lightning:lwc:test:run'];
  public static strict = false;
  public static '--' = true;
  // sfdx-lwc-jest flags `--version` and`--help` cannot be defined in flags given they are reserved by oclif
  public static readonly flags = {
    debug: Flags.boolean({
      char: 'd',
      summary: messages.getMessage('flags.debug.summary'),
      description: messages.getMessage('flags.debug.description'),
    }),
    watch: Flags.boolean({
      summary: messages.getMessage('flags.watch.summary'),
      description: messages.getMessage('flags.watch.description'),
      exclusive: ['debug'],
    }),
    coverage: Flags.boolean({
      summary: messages.getMessage('flags.coverage.summary'),
      description: messages.getMessage('flags.coverage.description'),
    }),
    // eslint-disable-next-line sf-plugin/flag-case
    updateSnapshot: Flags.boolean({
      char: 'u',
      summary: messages.getMessage('flags.updateSnapshot.summary'),
      description: messages.getMessage('flags.updateSnapshot.description'),
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
      description: messages.getMessage('flags.verbose.description'),
    }),
    // eslint-disable-next-line sf-plugin/flag-case
    skipApiVersionCheck: Flags.boolean({
      summary: messages.getMessage('flags.skipApiVersionCheck.summary'),
      description: messages.getMessage('flags.skipApiVersionCheck.description'),
    }),
    loglevel,
  };

  private flagKeys = Object.keys(RunTest.flags);

  public async run(): Promise<RunResult> {
    /* In order to ensure backwards compatibility with old SfdxCommand version of this command
    * it was necessary to bypass the typical parsing of the command.
    *
    * This command defines two flags, debug and watch, which are probably the
    * most used jest flags. The previous implementation of this command also
    * defined an args configuration, (passthrough) which would allow any
    * additional flags to be passed through to jest. This is no longer possible
    * given how @oclif/core parses the command line, rejecting any flags that
    * are not defined in the flag configuration.
    *
    * The solution is two-fold. First, we change the command to allow non-strict
    * command configuration, as well as allowing the use of the pass through flag ('--').
    *
    * Second, we force the parse to use the config "{strict: false, '--': true}", instead
    * of passing the command class to the parse method. This allows a parse of the command
    * as if there are no flags defined, which results in the flags being parsed as arguments.
    *
    * Before calling the parse method, we filter out the '--' flag from the this.argv array and then
    * call the parse method overriding the argv with the first element being '--' and the rest of the
    * elements being the filtered argv array. This results in the parse method returning the flags
    * as arguments.
    *
    * The resulting argv array is then passed to the runJest method as arguments.
     */
    // remove the '--', '--json' and 'loglevel' flags from the this.argv array
    const tArgv = this.argv.filter((arg) => !['--', '--loglevel'].includes(arg));

    const hasWatchFlag = tArgv.includes('--watch');
    const hasDebugFlag = tArgv.some(arg => /--debug|-d/.test(arg));

    if (hasWatchFlag && hasDebugFlag) {
      throw (messages.createError('watchAndDebugAreMutuallyExclusive'));
    }

    // call the parse method with alternate config and override the argv
    // with the first element being '--' and the rest of the elements being
    const {argv} = await this.parse({strict: false, '--': true},
      ['--', ...tArgv]);

    // rearrange the argv array so that the cmd flags are at the beginning and everything else is at the end
    const cmdArgs = this.rearrangeCmdArgs(argv);

    const scriptRet = this.runJest(cmdArgs);

    const results: RunResult = {
      message: messages.getMessage('logSuccess', [scriptRet.status?.toString()]),
      jestExitCode: scriptRet.status ?? 1,
    };

    this.logSuccess(messages.getMessage('logSuccess', [scriptRet.status?.toString()]));
    return results;
  }

  public runJest(args: string[]): cp.SpawnSyncReturns<Buffer> {
    // on windows we must execute with the node prefix
    const executable = process.platform === 'win32' ? `node ${this.getExecutablePath()}` : this.getExecutablePath();

    return cp.spawnSync(executable, args, {
      stdio: 'inherit',
      shell: true,
    });
  }

  private rearrangeCmdArgs(argv: unknown[]): string[] {
    const cmdArgs = argv.map(arg => arg as string).reduce((jestArgs: string[], arg: string) => {
      if (!arg.startsWith('-')) {
        jestArgs.push(arg);
      }
      const argSansHyphen = (arg).replace(/^-+/, '');

      if (this.flagKeys.some(key => key === argSansHyphen || RunTest.flags[key as keyof typeof RunTest.flags].char === argSansHyphen)) {
        jestArgs.unshift(arg);
      } else {
        jestArgs.push(arg);
      }
      return jestArgs;
    }, ['--']);
    return cmdArgs;
  }

  private getExecutablePath(): string {
    const projectPath = this.project.getPath();
    const nodeModulePath =
      process.platform === 'win32'
        ? path.join('@salesforce', 'sfdx-lwc-jest', 'bin', 'sfdx-lwc-jest')
        : path.join('.bin', 'sfdx-lwc-jest');

    const executablePath = path.join(projectPath, 'node_modules', nodeModulePath);
    if (!fs.existsSync(executablePath)) {
      throw messages.createError('errorNoExecutableFound', [this.config.bin]);
    }
    return executablePath;
  }
}
