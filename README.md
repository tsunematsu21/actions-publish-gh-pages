# Publish to GitHub Pages :sushi:

[![Actions Status](https://github.com/tsunematsu21/actions-publish-gh-pages/workflows/Publish%20Typedoc%20to%20GitHub%20Pages/badge.svg)](https://github.com/tsunematsu21/actions-publish-gh-pages/actions)

A GitHub Action to publish static website using [GitHub Pages](https://pages.github.com/).  
This Action provides publish arbitrary directory that contains static content in your workflow to the GitHub page.  

## Usage

### Inputs

* `dir` - The directory that containing the content to be published. Can be specified as an absolute path or a relative path from the [`$GITHUB_WORKSPACE`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/using-environment-variables#default-environment-variables).
* `branch` - The remote branch that publishing source for GitHub Pages site, defaults tp `gh-pages`.
* `repo` - The remote repository slug that publishing source for GitHub Pages site, defaults to current repo. The slug is formatted like `user/repo-name`.
* `token` - The personal access token that authorize access to repo. (cf. [GitHub Help](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line))
* `name` - The committer name, defaults to [`$GITHUB_ACTOR`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/using-environment-variables#default-environment-variables).
* `email` - The committer name, defaults to `${GITHUB_ACTOR}@users.noreply.github.com`.

### Example workflow

```yaml
name: Publish to GitHub Pages

on:
  push:
    branches:
      - master

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v1

      - name: Generate your awesome content
        run: # Your amazing generate action

      - name: Publish generated content to GitHub Pages
        uses: tsunematsu21/actions-publish-gh-pages@v0.1.0
        with:
          dir: dist
          branch: gh-pages
          token: ${{ secrets.ACCESS_TOKEN }}
```

## Document
Typedoc published by [GitHub Pages site](https://tsunematsu21.github.io/actions-publish-gh-pages/)

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
