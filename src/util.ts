import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as io from "@actions/io";

export const TEMPORARY_DIRECTORY = `${process.env.HOME}/actions_publish_gh_pages_temporary_directory`;

export function git(cmd: string, cwd: string): Promise<number> {
  return exec(`git ${cmd}`, [], { cwd });
}

export async function makeTemporaryDirectory(
  path: string = TEMPORARY_DIRECTORY
): Promise<string> {
  try {
    await io.mkdirP(path);
    return path;
  } catch (error) {
    throw new Error(
      `There was an error making the temporary directory. ${error}`
    );
  }
}

export async function initializeLocalRepository(
  cwd: string,
  url: string
): Promise<void> {
  await git(`init`, cwd).catch(error => {
    throw new Error(
      `There was an error initilizing local repository. ${error}`
    );
  });
  await git(`remote add origin "${url}"`, cwd).catch(error => {
    throw new Error(`There was an error adding remote repository. ${error}`);
  });
  await git(`fetch --prune`, cwd).catch(error => {
    throw new Error(`There was an error fetching remote repository. ${error}`);
  });
}

export async function checkout(cwd: string, branch: string): Promise<void> {
  await git(`checkout -b ${branch} origin/${branch}`, cwd)
    .catch(async () => {
      await git(`checkout --orphan ${branch}`, cwd);
    })
    .catch(error => {
      throw new Error(`There was an error checking out the branch. ${error}`);
    });
  // try {
  //   await git(`checkout -b ${branch} origin/${branch}`, cwd);
  // } catch (error) {
  //   try {
  //     await git(`checkout --orphan ${branch}`, cwd);
  //   } catch (error) {
  //     throw new Error(`There was an error checking out the branch. ${error}`);
  //   }
  // }
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
    throw new Error(error);
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
    throw new Error(error);
  }
}
