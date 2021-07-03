import * as core from "@actions/core";
import { directory, branch, repository, url, name, email } from "./context";
import * as util from "./util";

export async function publish(): Promise<void> {
  const message = `Publish '${directory}' to '${branch}' in '${repository}'`;

  try {
    core.info(`Start: ${message}`);

    core.startGroup(`Initialize local repository`);
    core.debug(`Remote: ${url}`);
    core.debug(`Branch: ${branch}`);
    await util.init(url, branch);
    core.endGroup();

    core.startGroup(`Update local repository`);
    core.debug(`Content directory: ${directory}`);
    await util.update(directory);
    core.endGroup();

    core.startGroup(`Push local repository`);
    core.debug(`Committer name: ${name}`);
    core.debug(`Committer email: ${email}`);
    core.debug(`Commit message: ${message}`);
    await util.push(name, email, message);
    core.endGroup();

    core.info(`End: ${message}`);
  } catch (error) {
    core.setFailed(error);
  }
}

publish();
