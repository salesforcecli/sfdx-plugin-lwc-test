@salesforce/plugin-lwc-test
=============

Tools for unit testing Lightning web components in a Salesforce DX workspace

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g @salesforce/plugin-lwc-test
$ @salesforce/plugin-lwc-test COMMAND
running command...
$ @salesforce/plugin-lwc-test (-v|--version|version)
@salesforce/plugin-lwc-test/0.0.1 darwin-x64 node-v8.12.0
$ @salesforce/plugin-lwc-test --help [COMMAND]
USAGE
  $ @salesforce/plugin-lwc-test COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`@salesforce/plugin-lwc-test <%= command.id %> -f <string> [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#salesforceplugin-lwc-test--commandid---f-string---json---loglevel-tracedebuginfowarnerrorfatal)
* [`@salesforce/plugin-lwc-test <%= command.id %> [-d] [--watch] [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#salesforceplugin-lwc-test--commandid---d---watch---json---loglevel-tracedebuginfowarnerrorfatal)
* [`@salesforce/plugin-lwc-test <%= command.id %> [--json] [--loglevel trace|debug|info|warn|error|fatal]`](#salesforceplugin-lwc-test--commandid----json---loglevel-tracedebuginfowarnerrorfatal)

## `@salesforce/plugin-lwc-test <%= command.id %> -f <string> [--json] [--loglevel trace|debug|info|warn|error|fatal]`

create a Lightning web component test with boilerplate code inside a __tests__ directory

```
USAGE
  $ @salesforce/plugin-lwc-test lwc:test:create -f <string> [--json] [--loglevel trace|debug|info|warn|error|fatal]

OPTIONS
  -f, --filepath=filepath                         (required) path to Lightning web component js file to create a test
                                                  for

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx force:lightning:lwc:test:create -f force-app/main/default/lwc/myButton/myButton.js
```

_See code: [src/commands/lwc/test/create.ts](https://github.com/trevor-bliss/sfdx-lwc-test/blob/v0.0.1/src/commands/lwc/test/create.ts)_

## `@salesforce/plugin-lwc-test <%= command.id %> [-d] [--watch] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

invoke Lightning web component Jest unit tests

```
USAGE
  $ @salesforce/plugin-lwc-test lwc:test:run [-d] [--watch] [--json] [--loglevel trace|debug|info|warn|error|fatal]

OPTIONS
  -d, --debug                                     run tests in debug mode
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation
  --watch                                         run tests in watch mode

EXAMPLES
  $ sfdx force:lightning:lwc:test:run
  $ sfdx force:lightning:lwc:test:run -w
```

_See code: [src/commands/lwc/test/run.ts](https://github.com/trevor-bliss/sfdx-lwc-test/blob/v0.0.1/src/commands/lwc/test/run.ts)_

## `@salesforce/plugin-lwc-test <%= command.id %> [--json] [--loglevel trace|debug|info|warn|error|fatal]`

install Jest unit testing tools for Lightning web components

```
USAGE
  $ @salesforce/plugin-lwc-test lwc:test:setup [--json] [--loglevel trace|debug|info|warn|error|fatal]

OPTIONS
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx force:lightning:lwc:test:install
```

_See code: [src/commands/lwc/test/setup.ts](https://github.com/trevor-bliss/sfdx-lwc-test/blob/v0.0.1/src/commands/lwc/test/setup.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
