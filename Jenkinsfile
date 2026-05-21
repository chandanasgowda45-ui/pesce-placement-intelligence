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

        stage('Run Docker Compose') {
    steps {
        bat 'docker-compose down'
        bat 'docker-compose up --build -d'
    }
}
    }
}