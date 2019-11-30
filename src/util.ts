import * as path from "path";
import { exec } from "@actions/exec";
import * as io from "@actions/io";

const cwd = path.join(
  process.env.HOME,
  "/actions_publish_gh_pages_temporary_directory"
);

async function git(cmd: string): Promise<number> {
  return await exec(`git ${cmd}`, [], { cwd });
}

export async function init(url: string, branch: string): Promise<void> {
  await io.mkdirP(cwd);
  await git(`init`);
  await git(`remote add origin "${url}"`);
  await git(`fetch --prune`);

  try {
    await git(`checkout -b ${branch} origin/${branch}`);
  } catch (error) {
    await git(`checkout --orphan ${branch}`);
  }
}

export async function update(src: string, clean = true): Promise<void> {
  if (clean) await git(`rm -r --ignore-unmatch '*'`);
  await io.cp(`${src}/.`, `${cwd}/.`, { recursive: true });
}

export async function push(
  name: string,
  email: string,
  message: string
): Promise<void> {
  await git(`add --all`);
  await git(`config user.name "${name}"`);
  await git(`config user.email "${email}"`);
  await git(`commit -m "${message}"`);
  await git(`config push.default current`);
  await git(`push origin`);
}
