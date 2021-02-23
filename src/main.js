const core = require("@actions/core");
const search = require('./search.js');

async function run() {
  try {
    const searchString = search.getSearchString();
	  const data = await search.searchCode(searchString);

    console.log(`${data.total_count} results`);
    core.setOutput("ResultsCount", data.total_count);
    for (const result of data.items) {
      console.log(`Repository: ${result.repository.name} filename:${result.name}`)
      core.setOutput("Filename", result.name);
      core.setOutput("Repository", result.repository.name);
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run()