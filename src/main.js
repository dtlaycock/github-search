const core = require("@actions/core");
const search = require('./search.js');

async function run() {
  try {
    const searchString = search.getSearchString();
	  const items = await search.searchCode(searchString);

    for (const result of items) {
      console.log(`Repository: ${result.repository.name} filename:${result.name}`)
      core.setOutput("Filename", result.name);
      core.setOutput("Repository", result.repository.name);
    }
  } catch (err) {
      core.setFailed(err.message);
  }
}

run()