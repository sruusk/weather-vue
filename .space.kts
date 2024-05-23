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

    container("Run deploy script", image = "node:18") {
        cache {
            // To upload to another repo (e.g., 'my-file-repo'), uncomment the next line
            // location = CacheLocation.FileRepository(name = "my-file-repo", remoteBasePath = "caches/{{ run:job.repository }}")

            // Generate cache file name
            // Using a hash of the build file ensures all job runs with the
            // same package.json will share the cached dependencies
            storeKey = "npm-{{ hashFiles('package.json') }}"

            // Fallback option
            // If the right cache file is not found, get cache from 'npm-master.tar.gz'
            restoreKeys {
                +"npm-master"
            }

            // Local path to the cache file directory
            localPath = "node_modules"
        }

        env["VITE_OPEN_WEATHER"] = "{{ project:openweather }}"
        env["VITE_MML"] = "{{ project:mml }}"
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
            """
        }

        fileArtifacts {
            localPath = "dist"
            remotePath = "dist.zip"
            archive = true
        }
    }

    container("Call webhook", image = "debian:11") {
        env["address"] = "{{ project:address }}"
        env["artifacts"] = "{{ run:job.repository }}/jobs/{{ dashify('{{ run:job.name }}') }}-{{ run:job.id }}/{{ run:number }}-{{ run:id }}"

        shellScript {
            interpreter = "/bin/sh"
            content = """
                apt update
                apt install curl -y
                curl -f -L "https://${'$'}address/webhook/weather?q=${'$'}artifacts"
            """
        }
    }
}
