import * as path from "path";

const payload = path.join(__dirname, "payload.json");
const envs = {
  // For @actions/core
  INPUT_DIR: "dist",
  INPUT_BRANCH: "develop",
  INPUT_REPO: "foo/bar",
  INPUT_TOKEN: "MyToken",
  INPUT_NAME: "foo",
  INPUT_EMAIL: "foo@bar.com",

  // For @actions/github
  GITHUB_REPOSITORY: "foo/bar",
  GITHUB_EVENT_PATH: payload,
  GITHUB_ACTOR: "actor"
};

describe("context", () => {
  let context, core, github;

  beforeEach(async () => {
    for (const key in envs) {
      process.env[key] = envs[key as keyof typeof envs];
    }

    context = await import("../src/context");
    core = await import("@actions/core");
    github = await import("@actions/github");
  });

  describe("directory", () => {
    it('should be input variable "directory"', async () => {
      expect(context.directory).toBe(core.getInput("dir"));
    });
  });

  describe("branch", () => {
    it('should be input variable "branch"', async () => {
      expect(context.branch).toBe(core.getInput("branch"));
    });
  });

  describe("repository", () => {
    it('should be input variable "repository"', async () => {
      expect(context.repository).toBe(core.getInput("repo"));
    });

    it('should be repository full name if input variable "repository" is not set', async () => {
      jest.resetModules();
      delete process.env.INPUT_REPO;
      context = await import("../src/context");
      expect(context.repository).toBe(
        github.context.payload.repository.full_name
      );
    });
  });

  describe("token", () => {
    it('should be input variable "token"', async () => {
      expect(context.token).toBe(core.getInput("token"));
    });
  });

  describe("url", () => {
    it("should be GitHub repository URL with access token", async () => {
      expect(context.url).toBe(
        `https://${context.token}@github.com/${context.repository}.git`
      );
    });
  });

  describe("name", () => {
    it('should be input variable "name"', async () => {
      expect(context.name).toBe(core.getInput("name"));
    });

    it('should be environment variable GITHUB_ACTOR if input variable "name" is not set', async () => {
      jest.resetModules();
      delete process.env.INPUT_NAME;
      context = await import("../src/context");
      expect(context.name).toBe(process.env.GITHUB_ACTOR);
    });
  });

  describe("email", () => {
    it('should be input variable "email"', async () => {
      expect(context.email).toBe(core.getInput("email"));
    });

    it('should be GitHub-provided "noreply" email address if input variable "email" is not set', async () => {
      jest.resetModules();
      delete process.env.INPUT_EMAIL;
      context = await import("../src/context");
      expect(context.email).toBe(
        `${process.env.GITHUB_ACTOR}@users.noreply.github.com`
      );
    });
  });
});
