pipeline {
  agent any

  triggers {
    pollSCM('H/5 * * * *')
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
    timeout(time: 10, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'node --version && npm --version'
        sh 'npm ci --ignore-scripts --no-audit --no-fund'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
  }
}