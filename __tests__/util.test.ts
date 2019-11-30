const envs = {
  // For @actions/core
  INPUT_DIR: "dist",
  INPUT_BRANCH: "develop",
  INPUT_REPO: "foo/bar",
  INPUT_TOKEN: "MyToken",
  INPUT_NAME: "foo",
  INPUT_EMAIL: "foo@bar.com",
  HOME: "/home"
};

describe("util", () => {
  let util;

  beforeEach(async () => {
    for (const key in envs) {
      process.env[key] = envs[key as keyof typeof envs];
    }

    util = await import("../src/util");
  });

  describe("init()", () => {
    expect(0).toBe(0);
  });
});
