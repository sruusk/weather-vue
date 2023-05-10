/**
* JetBrains Space Automation
* This Kotlin-script file lets you automate build activities
* For more info, see https://www.jetbrains.com/help/space/automation.html
*/

job("Qodana") {
   container("jetbrains/qodana-js") {
      env["QODANA_TOKEN"] = Secrets("qodana-token")
      shellScript {
         content = """
         	npm ci
            QODANA_REMOTE_URL="ssh://git@git.${'$'}JB_SPACE_API_URL/${'$'}JB_SPACE_PROJECT_KEY/${'$'}JB_SPACE_GIT_REPOSITORY_NAME.git" \
            QODANA_BRANCH=${'$'}JB_SPACE_GIT_BRANCH \
            QODANA_REVISION=${'$'}JB_SPACE_GIT_REVISION \
            qodana
         """.trimIndent()
      }
   }
}

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
        env["VITE_OPEN_WEATHER"] = Secrets("openweather")
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
                Echo Removing previous deployment
                sshpass -p ${'$'}passwd ssh weather@weather.a32.fi "rm -R dist && mkdir dist"
                Echo Transferring files to server
                sshpass -p ${'$'}passwd scp -v -o StrictHostKeyChecking=no -r ./dist/* weather@weather.a32.fi:/opt/www/weather/dist/
                echo Deployment complete!
            """
        }
    }
}
