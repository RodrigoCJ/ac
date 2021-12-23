const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const TENOR_TOKEN = core.getInput('TENOR_TOKEN');
    const TRELLO_KEY = core.getInput('TRELLO_KEY');
    const TRELLO_TOKEN = core.getInput('TRELLO_TOKEN');
    const TRELLO_IDLIST = core.getInput('TRELLO_IDLIST');
    const octokit = github.getOctokit(GITHUB_TOKEN);
    var results;

    do{
        const randomPos = Math.round(Math.random() * 10000);;
        const url = `https://api.tenor.com/v1/search?q=thank%20you&pos=${randomPos}&limit=1&media_filter=minimal&contentfilter=high&key=${TENOR_TOKEN}`;
        const response = await fetch(url);
        results = await response.json();
    }while(results['next'] === "0" );

    const gifUrl = results['results'][0]['media'][0]['tinygif']['url'];

    const { context = {} } = github;
    const { pull_request } = context.payload;

    await commenta();

    function commenta(){
        var nome = `Nova pull request de ${pull_request.user.login} em ${pull_request.repository}`;
        var msg = pull_request.body
        .split('Start Artia Comment')
        .pop()
        .split('End Artia Comment')[0]
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    
        octokit.rest.issues.createComment({
            ...context.repo,
            issue_number: pull_request.number,
            body: `Obrigado pela pull request, vamos analiza-la o mais rapido possivel.\n\n<img src="${gifUrl}" alt="obrigado" />`
        });
    
        const url_trello = `https://api.trello.com/1/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&name=${nome}&desc=${msg}&idList=${TRELLO_IDLIST}`;
        fetch(url_trello, {method: 'POST',headers: {'Accept': 'application/json'}});
        console.log("API");
    }
}


run();