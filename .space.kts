/**
* JetBrains Space Automation
* This Kotlin-script file lets you automate build activities
* For more info, see https://www.jetbrains.com/help/space/automation.html
*/

job("Deploy") {
    // run on commit to a branch containing "master"
    startOn {
        gitPush {
            branchFilter {
                +Regex("master")
            }
        }
    }

    container("Run deploy script", image = "node:16-alpine") {
        kotlinScript { api ->
            // create and start deployment
            api.space().projects.automation.deployments.start(
                project = api.projectIdentifier(),
                targetIdentifier = TargetIdentifier.Id("hetzner-vps"),
                version = System.getenv("JB_SPACE_EXECUTION_NUMBER"),
                // sync the job and deployment states
                syncWithAutomationJob = true
            )
        }
        env["SSHKEY"] = Secrets("openssh-key")
        shellScript {
            interpreter = "/bin/sh"
            content = """
                echo Install npm dependencies...
                npm ci
                echo Run type check
                npm run type-check
                echo Run build ...
                npm run build
                echo Deploying...
                echo ${'$'}SSHKEY > ~/.ssh/id_rsa
                scp -i ~/.ssh/id_rsa ./dist/* weather@weather.a32.fi:/opt/www/weather/
                echo Deployment complete!
            """
        }
    }
}