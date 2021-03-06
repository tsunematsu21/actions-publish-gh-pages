import * as path from "path";

const envs = {
  // For @actions/core
  INPUT_DIR: "dist",
  INPUT_BRANCH: "develop",
  INPUT_REPO: "foo/bar",
  INPUT_TOKEN: "MyToken",
  INPUT_NAME: "foo",
  INPUT_EMAIL: "foo@bar.com",
  HOME: path.join(__dirname, "_test")
};
const temporaryDirectory = path.join(
  envs.HOME,
  "actions_publish_gh_pages_temporary_directory"
);

describe("util", () => {
  const spyLog = jest.spyOn(console, "log");
  let context,
    util,
    onErrorStartsWith = "";

  jest.mock("@actions/io", () => ({
    async mkdirP(fsPath: string): Promise<void> {
      console.log(`mkdir ${fsPath}`);
    },
    async cp(
      source: string,
      dest: string,
      options: { recursive: boolean }
    ): Promise<void> {
      console.log(`copy ${options ? "-r" : ""} ${source} ${dest}`);
    }
  }));

  jest.mock("@actions/exec", () => ({
    async exec(
      cmd: string,
      args?: string[],
      options?: { cwd: string }
    ): Promise<number> {
      const command = `${options.cwd}> ${cmd} ${args.join(" ")}`.trim();
      console.log(command);
      if (onErrorStartsWith && cmd.startsWith(onErrorStartsWith)) {
        throw new Error(command);
      }
      return 0;
    }
  }));

  beforeEach(async () => {
    for (const key in envs) {
      process.env[key] = envs[key as keyof typeof envs];
    }
    context = await import("../src/context");
    util = await import("../src/util");

    spyLog.mockReset();
    spyLog.mockImplementation(x => x);
    onErrorStartsWith = "";
  });

  describe("init()", () => {
    it("should be make temporary directory", async () => {
      await util.init(context.url, context.branch);
      expect(spyLog.mock.calls[0][0]).toBe(`mkdir ${temporaryDirectory}`);
    });

    it("should be initialize local git repository", async () => {
      await util.init(context.url, context.branch);
      expect(spyLog.mock.calls[1][0]).toBe(`${temporaryDirectory}> git init`);
    });

    it("should be add remote git repository", async () => {
      await util.init(context.url, context.branch);
      expect(spyLog.mock.calls[2][0]).toBe(
        `${temporaryDirectory}> git remote add origin "${context.url}"`
      );
    });

    it("should be fetch remote git repository", async () => {
      await util.init(context.url, context.branch);
      expect(spyLog.mock.calls[3][0]).toBe(
        `${temporaryDirectory}> git fetch --prune`
      );
    });

    it("should be checkout from remote branch", async () => {
      await util.init(context.url, context.branch);
      expect(spyLog.mock.calls[4][0]).toBe(
        `${temporaryDirectory}> git checkout -b ${context.branch} origin/${context.branch}`
      );
    });

    it("should be checkout orphan branch if remote branch is not exists", async () => {
      onErrorStartsWith = `git checkout -b ${context.branch} origin/${context.branch}`;
      await util.init(context.url, context.branch);
      expect(spyLog.mock.calls[5][0]).toBe(
        `${temporaryDirectory}> git checkout --orphan ${context.branch}`
      );
    });
  });

  describe("update()", () => {
    it("should be clear temporary directory", async () => {
      await util.update(context.directory);
      expect(spyLog.mock.calls[0][0]).toBe(
        `${temporaryDirectory}> git rm -r --ignore-unmatch '*'`
      );
    });

    it("should be copy contents to temporary directory", async () => {
      await util.update(context.directory);
      expect(spyLog.mock.calls[1][0]).toBe(
        `copy -r ${context.directory}/. ${temporaryDirectory}/.`
      );
    });

    it("shouldn't be clear temporary directory if clean flag is false", async () => {
      await util.update(context.directory, false);
      expect(spyLog.mock.calls[0][0]).toBe(
        `copy -r ${context.directory}/. ${temporaryDirectory}/.`
      );
    });
  });

  describe("push()", () => {
    const message = "Commit message";
    it("should be add to stage", async () => {
      await util.push(context.user, context.email, message);
      expect(spyLog.mock.calls[0][0]).toBe(
        `${temporaryDirectory}> git add --all`
      );
    });

    it("should be setting user.name", async () => {
      await util.push(context.user, context.email, message);
      expect(spyLog.mock.calls[1][0]).toBe(
        `${temporaryDirectory}> git config user.name "${context.user}"`
      );
    });

    it("should be setting user.email", async () => {
      await util.push(context.user, context.email, message);
      expect(spyLog.mock.calls[2][0]).toBe(
        `${temporaryDirectory}> git config user.email "${context.email}"`
      );
    });

    it("should be commit with message", async () => {
      await util.push(context.user, context.email, message);
      expect(spyLog.mock.calls[3][0]).toBe(
        `${temporaryDirectory}> git commit -m "${message}"`
      );
    });

    it("should be setting push.default to current", async () => {
      await util.push(context.user, context.email, message);
      expect(spyLog.mock.calls[4][0]).toBe(
        `${temporaryDirectory}> git config push.default current`
      );
    });

    it("should be push local repository to remote", async () => {
      await util.push(context.user, context.email, message);
      expect(spyLog.mock.calls[5][0]).toBe(
        `${temporaryDirectory}> git push origin`
      );
    });
  });
});
