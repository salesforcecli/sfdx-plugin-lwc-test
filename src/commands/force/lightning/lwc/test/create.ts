/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { Messages, SfError } from '@salesforce/core';
import { Flags, loglevel, SfCommand } from '@salesforce/sf-plugins-core';

export type CreateResult = {
  message: string;
  testPath: string;
  className: string;
  elementName: string;
};

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/sfdx-plugin-lwc-test', 'create');

export default class Create extends SfCommand<CreateResult> {
  public static readonly summary = messages.getMessage('commandDescription');
  public static readonly description = messages.getMessage('longDescription');
  public static readonly examples = messages.getMessages('example');
  public static readonly requiresProject = true;
  public static readonly flags = {
    filepath: Flags.string({
      char: 'f',
      summary: messages.getMessage('filepathFlagDescription'),
      description: messages.getMessage('filepathFlagLongDescription'),
      required: true,
    }),
    loglevel,
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<CreateResult> {
    const { flags } = await this.parse(Create);
    const testDirName = '__tests__';
    const filepath = flags.filepath;

    const modulePath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    if (path.extname(modulePath) !== '.js') {
      throw new SfError(messages.getMessage('errorFileNotJs', [flags.filepath]));
    }
    if (!fs.existsSync(modulePath)) {
      throw new SfError(messages.getMessage('errorFileNotFound', [flags.filepath]));
    }

    const bundlePath = path.dirname(modulePath);
    const testDirPath = path.join(bundlePath, testDirName);

    const moduleName = path.basename(modulePath, '.js');
    const testName = `${moduleName}.test.js`;
    const testPath = path.join(testDirPath, testName);
    if (fs.existsSync(testPath)) {
      throw new SfError(messages.getMessage('errorFileExists', [testPath]));
    }

    const className = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const elementName = 'c-' + moduleName.replace(/[A-Z]/g, '-$&').toLowerCase();

    const testSuiteTemplate = `import { createElement } from 'lwc';
import ${className} from 'c/${moduleName}';

describe('${elementName}', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        const element = createElement('${elementName}', {
            is: ${className}
        });
        document.body.appendChild(element);
        expect(1).toBe(2);
    });
});`;

    if (!fs.existsSync(testDirPath)) {
      fs.mkdirSync(testDirPath);
    }
    fs.writeFileSync(testPath, testSuiteTemplate);

    this.log(messages.getMessage('logSuccess', [testPath]));
    return {
      message: messages.getMessage('logSuccess', [testPath]),
      testPath,
      className,
      elementName,
    };
  }
}
