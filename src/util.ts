import { exec } from "@actions/exec";
import * as io from "@actions/io";

export const TEMPORARY_DIRECTORY = `${process.env.HOME}/actions_publish_gh_pages_temporary_directory`;

export async function git(cmd: string, cwd: string): Promise<number> {
  return await exec(`git`, [cmd], { cwd });
}

export async function makeTemporaryDirectory(
  path: string = TEMPORARY_DIRECTORY
): Promise<string> {
  await io.mkdirP(path);
  return path;
}

export async function initializeLocalRepository(
  cwd: string,
  branch: string,
  url: string
): Promise<string> {
  try {
    await git(`clone --depth=1 --single-branch --branch ${branch} ${url}`, cwd);
  } catch (error) {
    await git(`init`, cwd);
    await git(`checkout --orphan "${branch}"`, cwd);
    await git(`remote add origin "${url}"`, cwd);
  }
  return cwd;
}

export async function updateLocalRepository(
  cwd: string,
  src: string,
  clean = true
): Promise<void> {
  if (clean) {
    await git(`rm -r --ignore-unmatch '*'`, cwd);
  }

  await io.cp(`${src}/.`, `${cwd}/.`);
}

export async function pushLocalRepository(
  cwd: string,
  name: string,
  email: string,
  message: string
): Promise<void> {
  // Add
  await git(`add --all`, cwd);

  // Commit
  await git(`config user.name "${name}"`, cwd);
  await git(`config user.email "${email}"`, cwd);
  await git(`commit -m "${message}"`, cwd);

  // Push
  await git(`config push.default current`, cwd);
  await git(`push origin`, cwd);
}
