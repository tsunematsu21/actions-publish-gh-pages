import * as core from "@actions/core";
import { directory, branch, repository, url, name, email } from "./context";
import * as util from "./util";

export async function publish(): Promise<void> {
  const message = `Publish '${directory}' directory to '${branch}' branch in '${repository}' repository`;

  try {
    core.info(`Start: ${message}`);

    core.startGroup(`Initialize local repository`);
    core.debug(`Remote: ${url}`);
    core.debug(`Branch: ${branch}`);
    await util.init(url, branch);
    core.endGroup();

    core.startGroup(`Update local repository`);
    core.debug(`Contents directory: ${directory}`);
    await util.update(directory);
    core.endGroup();

    core.startGroup(`Push local repository`);
    core.debug(`Commiter name: ${name}`);
    core.debug(`Commiter email: ${email}`);
    core.debug(`Commit messagge: ${message}`);
    await util.push(name, email, message);
    core.endGroup();

    core.info(`End: ${message}`);
  } catch (error) {
    core.setFailed(error);
  }
}

publish();
