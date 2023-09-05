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

    container("Run deploy script", image = "node:16") {
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
                echo Transferring files to server
                echo Deployment complete!
            """
        }

        fileArtifacts {
            localPath = "dist"
            remotePath = "dist.zip"
            archive = true
        }
    }

    container("Call webhook", image = "node:16") {
        env["address"] = "{{ project:address }}"
        env["artifacts"] = "{{ run:job.repository }}/jobs/{{ dashify('{{ run:job.name }}') }}-{{ run:job.id }}/{{ run:number }}-{{ run:id }}"

        shellScript {
            interpreter = "/bin/sh"
            content = """
                curl -f -L "https://${'$'}address/webhook?q=${'$'}artifacts"
            """
        }
    }
}
