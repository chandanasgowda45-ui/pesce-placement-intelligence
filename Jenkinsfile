pipeline {
    agent any
    environment {
    ENV_FILE = credentials('env-file')
}

    stages {

        stage('Install Dependencies') {
            steps {
                bat'copy "%ENV_FILE%" .env'
                bat 'cd frontend && npm install'
            }
        }

        stage('Build Project') {
            steps {
                bat 'cd frontend && npm run build'
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