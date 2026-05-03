pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.part2.yml'
    }

    stages {
        stage('Fetch Source') {
            steps {
                echo 'Fetching source code from GitHub'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building the containerized application'
                sh 'docker compose -f ${COMPOSE_FILE} build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying containers'
                sh 'docker compose -f ${COMPOSE_FILE} down || true'
                sh 'docker compose -f ${COMPOSE_FILE} up -d mongo-ci app-ci'
            }
        }

        stage('Wait for App') {
            steps {
                echo 'Waiting for application to be ready...'
                sh '''
                    for i in $(seq 1 60); do
                        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200\\|301\\|302"; then
                            echo "App is ready!"
                            break
                        fi
                        echo "Waiting... attempt $i/60"
                        sleep 5
                    done
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running Selenium test cases'
                sh 'mkdir -p test-results'
                sh 'docker compose -f ${COMPOSE_FILE} run --rm test-runner'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                    publishHTML(target: [
                        reportName: 'Selenium Test Report',
                        reportDir: 'test-results',
                        reportFiles: 'test-report.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true,
                        allowMissing: true
                    ])
                }
            }
        }

        stage('Verify') {
            steps {
                echo 'Verifying deployment'
                sh 'docker compose -f ${COMPOSE_FILE} ps'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! App is running on port 8081.'
            emailext(
                subject: "SUCCESS: NextAmplify Pipeline #${BUILD_NUMBER}",
                body: """
                    <h2>Pipeline Succeeded</h2>
                    <p><b>Job:</b> ${JOB_NAME}</p>
                    <p><b>Build:</b> #${BUILD_NUMBER}</p>
                    <p><b>Status:</b> SUCCESS</p>
                    <p>All Selenium test cases passed.</p>
                    <p><a href="${BUILD_URL}">View Build</a></p>
                """,
                mimeType: 'text/html',
                recipientProviders: [culprits(), developers(), requestor()],
                to: 'qasimalik@gmail.com'
            )
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
            sh 'docker compose -f ${COMPOSE_FILE} logs || true'
            emailext(
                subject: "FAILURE: NextAmplify Pipeline #${BUILD_NUMBER}",
                body: """
                    <h2>Pipeline Failed</h2>
                    <p><b>Job:</b> ${JOB_NAME}</p>
                    <p><b>Build:</b> #${BUILD_NUMBER}</p>
                    <p><b>Status:</b> FAILURE</p>
                    <p>Check the console output for details.</p>
                    <p><a href="${BUILD_URL}console">View Console Output</a></p>
                """,
                mimeType: 'text/html',
                recipientProviders: [culprits(), developers(), requestor()],
                to: 'qasimalik@gmail.com'
            )
        }
    }
}
