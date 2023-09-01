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
        env["passwd"] = "{{ project:weather-pass }}"
      	env["address"] = "{{ project:address }}"
        env["VITE_OPEN_WEATHER"] = "{{ project:openweather }}"
        env["SENTRY_AUTH_TOKEN"] = "{{ project:sentry }}"
        env["VITE_EXECUTION_NUMBER"] = "{{ run:number }}"

        shellScript {
            interpreter = "/bin/sh"
            content = """
                echo Install npm dependencies...
                npm ci
                echo Run type check
                npm run type-check
                echo Run build ...
                npm run build-only
                echo Deploying...
                apt update
                apt install -y lftp
                Echo Transferring files to server
                lftp -u ${'$'}passwd ${'$'}address -e "set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate no; mirror -R --delete --exclude web.config ./dist weather; quit"
                echo Deployment complete!
            """
        }
    }
}
