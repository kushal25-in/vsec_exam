# Focusboard CI

Focusboard is a responsive task board built to demonstrate a complete Jenkins continuous-integration workflow. Add tasks, set a due date and priority, move between inbox, today, upcoming and completed views, and keep everything in the browser's local storage.

## Run locally

Requires Node.js 20 or newer and npm. No third-party packages are needed.

```sh
npm test
npm run build
```

Open `index.html` in a browser to use the app. The production-ready static files are written to `dist/` by the build command.

## Jenkins pipeline

The root `Jenkinsfile` checks out the configured repository, installs from the lockfile, runs the test suite, and builds the static site. It uses Jenkins' built-in SCM polling trigger (`H/5 * * * *`), so changes pushed to the configured branch are picked up automatically, typically within five minutes.

### 1. Create and push the GitHub repository

Create an empty GitHub repository named `focusboard-ci-demo`. Do not initialize it with a README, since this project already has one. From this project directory, run:

```sh
git init
git add .
git commit -m "Build Focusboard Jenkins CI demo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/focusboard-ci-demo.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If Git asks you to authenticate, use GitHub's supported browser or token-based Git credential flow; do not put a token in the remote URL.

### 2. Install and start Jenkins

Install a current Jenkins LTS release and make sure the machine or agent running the job has Git, Node.js 20+, and npm on its `PATH`. During setup, install the suggested plugins. Confirm **Pipeline** and **Git** are installed under **Manage Jenkins → Plugins**. The **GitHub** plugin is only needed if you choose a webhook instead of polling.

### 3. Create the Pipeline job

1. Select **New Item**, enter `focusboard-ci`, choose **Pipeline**, and select **OK**.
2. Under **Pipeline**, set **Definition** to **Pipeline script from SCM**.
3. Choose **Git** as SCM, enter `https://github.com/YOUR-USERNAME/focusboard-ci-demo.git`, and set the branch to `*/main`.
4. Set **Script Path** to `Jenkinsfile`, save, and select **Build Now** once to verify the first run.

For a private repository, add a Jenkins credential with access to the repository and select it in the SCM configuration. Never commit credentials to this repository.

### 4. Verify automatic builds

The `pollSCM` trigger is defined in the Jenkinsfile; no extra trigger checkbox is required. After the first successful build, make a small change, commit it, and push it to `main`. In Jenkins, open the job's **Polling Log** and then **Build History**. The poll should detect the new revision and start a build automatically, usually within five minutes. Confirm that the new build passes the `Test` and `Build` stages.

For push-based triggering, install the **GitHub** plugin, configure a GitHub webhook to `https://YOUR-JENKINS-URL/github-webhook/`, and change the Jenkinsfile trigger to `githubPush()`. Jenkins must be reachable by GitHub for webhooks to work; polling is simpler for a local Jenkins installation.

## Project layout

```text
.
├── Jenkinsfile
├── index.html
├── package.json
├── scripts/build.js
├── src/
│   ├── app.js
│   ├── styles.css
│   └── task-store.js
└── test/task-store.test.js
```

The task model is separate from the DOM, so behavior is tested with Node's built-in test runner without extra packages.