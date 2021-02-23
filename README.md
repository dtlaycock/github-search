# github-search

This action searches for files across repositories.

## Inputs

### `Token`

**Required** The token will determine what repositories you have access to search. More details on how to create a Personal Access Token

### `Filename`
A complete filename can be specified or a fragment.

### `Extension`
Search for all files that have a particular extension.

### `Path`
Limit the search to a particular path.

### `Org`
Search repositories within a the specified organization.

### `User`
Limit the search to repositories owned by a particular user.

## Usage

```yaml
  on:
    push:
      branches:
        - main
  name: Find Github Actions workflows
  jobs:
    release-please:
      runs-on: ubuntu-latest
      steps:
        - uses: dtlaycock/github-search@v0.1
          with:
            access-token: ${{secrets.ACCESS_TOKEN}}
            extension: yml
            path: '.github/workflows'
```


