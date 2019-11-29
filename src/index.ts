import * as core from "@actions/core";
import { directory, branch, repository, url, name, email } from "./context";
import * as util from "./util";

async function publish(): Promise<void> {
  const temporaryDirectory = `${process.env.HOME}/actions_publish_gh_pages_temporary_directory`;
  const contentsDirectory = `${process.env.GITHUB_WORKSPACE}/${directory}`;
  const actionMessage = `Publish '${directory}' directory to '${branch}' branch in '${repository}' repository`;

  try {
    core.info(actionMessage);

    core.startGroup(`Make temporary directory`);
    const cwd = await util.makeTemporaryDirectory(temporaryDirectory);
    core.debug(`Temporary directory: ${cwd}`);
    core.endGroup();

    core.startGroup(`Initialize local repository`);
    core.debug(`Remote: ${url}`);
    core.debug(`Branch: ${branch}`);
    util.initializeLocalRepository(cwd, branch, url);
    core.endGroup();

    core.startGroup(`Update local repository`);
    core.debug(`Contents directory: ${contentsDirectory}`);
    util.updateLocalRepository(cwd, contentsDirectory);
    core.endGroup();

    core.startGroup(`Push local repository`);
    core.debug(`Commiter name: ${name}`);
    core.debug(`Commiter email: ${email}`);
    core.debug(`Commit messagge: ${actionMessage}`);
    util.pushLocalRepository(cwd, name, email, actionMessage);
    core.endGroup();
  } catch (error) {
    core.setFailed(error.actionMessage);
  }
}

publish();
