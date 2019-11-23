import { exec } from "@actions/exec";

const temporaryDirectory = `${process.env.HOME}/actions_publish_gh_pages_temporary_directory`;

async function execute(
  cmd: string,
  cwd: string = temporaryDirectory
): Promise<number> {
  return await exec(cmd, [], {
    cwd
  });
}

async function init(
  directory: string,
  branch: string,
  url: string
): Promise<void> {
  await execute(`mkdir ${temporaryDirectory}`, process.env.HOME);

  try {
    await execute(
      `git clone --depth=1 --single-branch --branch ${branch} ${url}`
    );
    await execute(`git rm -r --ignore-unmatch '*'`);
    await execute(`git remote rm origin`);
  } catch (error) {
    await execute(`git init`);
    await execute(`git checkout --orphan "${branch}"`);
  }

  await execute(
    `rsync -q -av --progress ${directory}/. ${temporaryDirectory}`,
    process.env.GITHUB_WORKSPACE
  );
}

async function add(): Promise<void> {
  await execute(`git add --all`);
}

async function commit(
  name: string,
  email: string,
  message: string
): Promise<void> {
  await execute(`git config user.name "${name}"`);
  await execute(`git config user.email "${email}"`);
  await execute(`git commit -m "${message}"`);
}

async function push(branch: string, url: string): Promise<void> {
  await execute(`git push ${url} HEAD:${branch}`);
}

export async function publish(
  directory: string,
  branch: string,
  url: string,
  name: string,
  email: string,
  message: string
): Promise<void> {
  await init(directory, branch, url);
  await add();
  await commit(name, email, message);
  await push(branch, url);
}
