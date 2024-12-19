# Usa un'immagine di base con Java e Node.js
FROM node:14

# Installa Java JDK richiesto per Android
RUN apt-get update && apt-get install -y openjdk-11-jdk wget unzip

# Scarica e installa Android Command Line Tools
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O android-tools.zip && \
    mkdir -p /usr/local/android-sdk/cmdline-tools && \
    unzip -q android-tools.zip -d /usr/local/android-sdk/cmdline-tools && \
    mv /usr/local/android-sdk/cmdline-tools/cmdline-tools /usr/local/android-sdk/cmdline-tools/latest && \
    rm android-tools.zip

# Configura le variabili d'ambiente
ENV ANDROID_SDK_ROOT=/usr/local/android-sdk
ENV PATH=$PATH:/usr/local/android-sdk/cmdline-tools/latest/bin:/usr/local/android-sdk/platform-tools

# Assicura che sdkmanager sia accessibile
RUN ls -la /usr/local/android-sdk/cmdline-tools/latest/bin && which sdkmanager

# Accetta le licenze Android e installa gli strumenti necessari
RUN yes | sdkmanager --licenses && \
    sdkmanager --install "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Installa Cordova
RUN npm install -g cordova

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file del progetto nell'immagine
COPY . .

# Comando di default per costruire l'app
CMD ["cordova", "build", "android", "--release"]
