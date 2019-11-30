import * as core from "@actions/core";
import * as github from "@actions/github";

const payload = github.context.payload;

export const directory = core.getInput("dir");
export const branch = core.getInput("branch");
export const repository = core.getInput("repo") || payload.repository.full_name;
export const token = core.getInput("token");
export const url = `https://${token}@github.com/${repository}.git`;
export const name = core.getInput("name") || process.env.GITHUB_ACTOR;
export const email =
  core.getInput("email") ||
  `${process.env.GITHUB_ACTOR}@users.noreply.github.com`;
