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

    container("openjdk:11") {
      kotlinScript { api ->
          api.space().projects.automation.deployments.start(
                project = api.projectIdentifier(),
                targetIdentifier = TargetIdentifier.Key("hetzner-vps"),
                version = api.executionId(),
              	// automatically update deployment status based on a status of a job
				syncWithAutomationJob = true
			)
		}
    }
    

    container("Run deploy script", image = "node:16") {
        env["passwd"] = Secrets("weather-pass")
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
                apt update
                apt install -y sshpass
                sshpass -p ${'$'}passwd scp -v -o StrictHostKeyChecking=no -r ./dist/* weather@weather.a32.fi:/opt/www/weather/
                echo Deployment complete!
            """
        }
    }
}