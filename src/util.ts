import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as io from "@actions/io";

export const TEMPORARY_DIRECTORY = `${process.env.HOME}/actions_publish_gh_pages_temporary_directory`;

export async function git(cmd: string, cwd: string): Promise<number> {
  const exitCode = await exec(`git ${cmd}`, [], { cwd });
  return Promise.resolve(exitCode);
}

export async function makeTemporaryDirectory(
  path: string = TEMPORARY_DIRECTORY
): Promise<string> {
  try {
    await io.mkdirP(path);
    return path;
  } catch (error) {
    core.setFailed(
      `There was an error making the temporary directory. ${error}`
    );
  }
}

export async function initializeLocalRepository(
  cwd: string,
  url: string
): Promise<void> {
  try {
    await git(`init`, cwd);
    // await git(`config user.name ""`, cwd);
    // await git(`config user.email ""`, cwd);
    await git(`remote add origin "${url}"`, cwd);
    await git(`fetch --prune`, cwd);
  } catch (error) {
    core.setFailed(
      `There was an error initializing the local repository. ${error}`
    );
  }
}

export async function checkout(cwd: string, branch: string): Promise<void> {
  try {
    await git(`checkout -b ${branch} origin/${branch}`, cwd);
  } catch (error) {
    try {
      await git(`checkout --orphan ${branch}`, cwd);
    } catch (error) {
      core.setFailed(`There was an error checking out the branch. ${error}`);
    }
  }
}

export async function updateLocalRepository(
  cwd: string,
  src: string,
  clean = true
): Promise<void> {
  try {
    if (clean) await git(`rm -r --ignore-unmatch '*'`, cwd);
    await io.cp(`${src}/.`, `${cwd}/.`, {
      recursive: true
    });
  } catch (error) {
    core.setFailed(
      `There was an error updating the local repository. ${error}`
    );
  }
}

export async function pushLocalRepository(
  cwd: string,
  name: string,
  email: string,
  message: string
): Promise<void> {
  try {
    await git(`add --all`, cwd);

    await git(`config user.name "${name}"`, cwd);
    await git(`config user.email "${email}"`, cwd);
    await git(`commit -m "${message}"`, cwd);

    await git(`config push.default current`, cwd);
    await git(`push origin`, cwd);
  } catch (error) {
    core.setFailed(`There was an error pushing the local repository. ${error}`);
  }
}
