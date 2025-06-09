pipeline {
    agent any

    tools {
        nodejs 'DefaultNodeJS'
        hudson.plugins.sonar.SonarRunnerInstallation 'sonar_test'
    }

    environment {
        SONAR_TOKEN = credentials('sonarqube-token')
        sonar_home = tool 'sonar_test_server'
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
                        ${sonar_home}/bin/sonar-scanner ^
                        -Dsonar.projectKey=sonar_test ^
                        -Dsonar.sources=src/ ^
                        -Dsonar.javascript.lcov.reportPaths=./coverage/lcov.info ^
                        -Dsonar.login=%SONAR_TOKEN% ^
                        -Dsonar.coverage.exclusions=src/routes/**,src/config/**,src/tests/**,src/server.js
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}