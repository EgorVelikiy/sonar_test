pipeline {
    agent any

    tools {
        nodejs 'DefaultNodeJS'
    }

    environment {
        SONAR_TOKEN = credentials('sonarqube-token')
        SONAR_HOME = tool 'sonar_test'
        SONAR_PROJECT_KEY = 'sonar_test'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Run Coverage') {
            steps {
                bat 'npm run coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar_test_server') {
                    bat """
                        ${SONAR_HOME}/bin/sonar-scanner ^
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} ^
                        -Dsonar.sources=src/ ^
                        -Dsonar.javascript.lcov.reportPaths=./coverage/lcov.info ^
                        -Dsonar.login=${SONAR_TOKEN} ^
                        -Dsonar.coverage.exclusions=src/routes/**,src/config/**,src/tests/**,src/server.js
                    """
                }
            }
        }
    }
}