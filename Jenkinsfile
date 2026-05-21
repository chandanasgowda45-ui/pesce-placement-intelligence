pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Project') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t placement-intelligence .'
            }
        }

        stage('Run Docker Container') {
            steps {
                bat 'docker stop placement-container || exit 0'
                bat 'docker rm placement-container || exit 0'
                bat 'docker run -d -p 5000:8080 --name placement-container placement-intelligence'
            }
        }
    }
}