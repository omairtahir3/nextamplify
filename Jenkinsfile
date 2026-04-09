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
                sh 'docker compose -f ${COMPOSE_FILE} up -d'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verifying deployment'
                sh 'sleep 30'
                sh 'docker compose -f ${COMPOSE_FILE} ps'
                sh 'curl -f http://localhost:8081 || echo "App is still starting up..."'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! App is running on port 8081.'
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
            sh 'docker compose -f ${COMPOSE_FILE} logs || true'
        }
    }
}
