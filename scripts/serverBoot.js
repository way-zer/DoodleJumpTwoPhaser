import path from "path";
import chalk from "chalk";
import {spawn} from "child_process";
import {build, createLogger} from "vite";

const root = path.resolve()

let manualRestart
let serverProcess

async function watchMainProcess() {
    try {
        return await build({
            mode: 'server',
            build: {
                watch: {}
            }
        })
    } catch (error) {
        createLogger().error(
            chalk.red(`error during watch main process:\n${error.stack}`)
        )
        process.exit(1)
    }
}

function startServer() {
    serverProcess = spawn('node', [
        path.join(root, 'dist/server.es.js'),
    ],{
        stdio: 'inherit'
    })
    serverProcess.on('close', () => {
        if (!manualRestart) process.exit()
    })
}

async function start() {
    const mainWatcher = await watchMainProcess()
    mainWatcher.on('event', (event) => {
        if (event.code === 'BUNDLE_END') {
            if (serverProcess && serverProcess.kill) {
                manualRestart = true
                process.kill(serverProcess.pid)
                serverProcess = null

                setTimeout(() => {
                    manualRestart = false
                }, 5000)
            }
            startServer()
        }
    })
}

start().then()