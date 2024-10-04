import {WriteStreamsMock} from "../../../src/write-streams";
import {handler} from "../../../src/handler";
import chalk from "chalk";
import {initSpawnSpy} from "../../mocks/utils.mock";
import {WhenStatics} from "../../mocks/when-statics";
import fs from "fs-extra";
import path from "path";

const cwd = "tests/test-cases/project-variables-file";
const emptyFileVariable = "dummy";
beforeAll(() => {
    initSpawnSpy([...WhenStatics.all]);
    fs.createFileSync(path.join(cwd, emptyFileVariable));
});

afterAll(() => {
    fs.removeSync(path.join(cwd, emptyFileVariable));
});

test.concurrent("project-variables-file <test-job>", async () => {
    const writeStreams = new WriteStreamsMock();
    await handler({
        cwd: cwd,
        job: ["test-job"],
    }, writeStreams);

    const expected = [
        chalk`{blueBright test-job} {greenBright >} Y`,
        chalk`{blueBright test-job} {greenBright >} Recursive CI/CD`,
    ];
    expect(writeStreams.stdoutLines).toEqual(expect.arrayContaining(expected));
});

test.concurrent("project-variables-file <issue-1333>", async () => {
    const writeStreams = new WriteStreamsMock();
    await handler({
        cwd: cwd,
        file: ".gitlab-ci-issue-1333.yml",
    }, writeStreams);

    const expected = [
        chalk`{blueBright issue-1333} {greenBright >} firecow`,
    ];
    expect(writeStreams.stdoutLines).toEqual(expect.arrayContaining(expected));
});

test.concurrent("project-variables-file custom-path", async () => {
    const writeStreams = new WriteStreamsMock();
    await handler({
        cwd: cwd,
        file: ".gitlab-ci-custom.yml",
        variablesFile: ".custom-local-var-file",
        job: ["job"],
    }, writeStreams);

    const expected = [
        chalk`{blueBright job} {greenBright >} firecow`,
    ];
    expect(writeStreams.stdoutLines).toEqual(expect.arrayContaining(expected));
});

test.concurrent("project-variables-file empty-variable-file", async () => {
    const writeStreams = new WriteStreamsMock();
    await handler({
        cwd: cwd,
        file: ".gitlab-ci-custom.yml",
        variablesFile: emptyFileVariable,
        job: ["job"],
        preview: true,
    }, writeStreams);
    expect(writeStreams.stdoutLines[0]).toEqual(`---
stages:
  - .pre
  - build
  - test
  - deploy
  - .post
job:
  image:
    name: busybox
  script:
    - echo $SECRET
job2:
  image:
    name: busybox
  script:
    - env | grep SECRET`);
});

test.concurrent("project-variables-file custom-path (.env)", async () => {
    const writeStreams = new WriteStreamsMock();
    await handler({
        cwd: cwd,
        file: ".gitlab-ci-custom.yml",
        variablesFile: ".env",
        job: ["job"],
    }, writeStreams);

    const expected = [
        chalk`{blueBright job} {greenBright >} holycow`,
    ];
    expect(writeStreams.stdoutLines).toEqual(expect.arrayContaining(expected));
});

test.concurrent("project-variables-file custom-path (.envs)", async () => {
    const writeStreams = new WriteStreamsMock();
    await handler({
        cwd: cwd,
        file: ".gitlab-ci-custom.yml",
        job: ["job2"],
        variablesFile: ".envs",
    }, writeStreams);

    const expected = [
        chalk`{blueBright job2} {greenBright >} SECRET_APP_DEBUG=true`,
        chalk`{blueBright job2} {greenBright >} SECRET_APP_ENV=local`,
        chalk`{blueBright job2} {greenBright >} SECRET_APP_KEY=`,
        chalk`{blueBright job2} {greenBright >} SECRET_APP_NAME=Laravel`,
        chalk`{blueBright job2} {greenBright >} SECRET_APP_URL=http://localhost`,
        chalk`{blueBright job2} {greenBright >} SECRET_BROADCAST_DRIVER=log`,
        chalk`{blueBright job2} {greenBright >} SECRET_CACHE_DRIVER=file`,
        chalk`{blueBright job2} {greenBright >} SECRET_DB_CONNECTION=mysql`,
        chalk`{blueBright job2} {greenBright >} SECRET_DB_DATABASE=laravel`,
        chalk`{blueBright job2} {greenBright >} SECRET_DB_HOST=127.0.0.1`,
        chalk`{blueBright job2} {greenBright >} SECRET_DB_PASSWORD=`,
        chalk`{blueBright job2} {greenBright >} SECRET_DB_PORT=3306`,
        chalk`{blueBright job2} {greenBright >} SECRET_DB_USERNAME=root`,
        chalk`{blueBright job2} {greenBright >} SECRET_FILESYSTEM_DISK=local`,
        chalk`{blueBright job2} {greenBright >} SECRET_LOG_CHANNEL=stack`,
        chalk`{blueBright job2} {greenBright >} SECRET_LOG_DEPRECATIONS_CHANNEL=null`,
        chalk`{blueBright job2} {greenBright >} SECRET_LOG_LEVEL=debug`,
        chalk`{blueBright job2} {greenBright >} SECRET_MEMCACHED_HOST=127.0.0.1`,
        chalk`{blueBright job2} {greenBright >} SECRET_QUEUE_CONNECTION=sync`,
        chalk`{blueBright job2} {greenBright >} SECRET_SESSION_DRIVER=file`,
        chalk`{blueBright job2} {greenBright >} SECRET_SESSION_LIFETIME=120`,
    ];

    expect(writeStreams.stdoutLines).toEqual(expect.arrayContaining(expected));
});
