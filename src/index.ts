import * as core from "@actions/core";
import { directory, branch, repository, url, name, email } from "./context";
import { publish } from "./publish";

async function run(): Promise<void> {
  try {
    console.log(
      `Publish '${directory}' directory to '${branch}' branch in '${repository}' repository`
    );

    publish(
      directory,
      branch,
      url,
      name,
      email,
      `Publish to '${branch}' branch`
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
