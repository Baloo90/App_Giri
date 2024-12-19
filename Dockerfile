# Usa un'immagine base con Node.js e Java
FROM node:14

# Installa Java e strumenti Android
RUN apt-get update && apt-get install -y openjdk-11-jdk wget unzip && rm -rf /var/lib/apt/lists/*

# Scarica e configura gli strumenti della riga di comando Android
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O android-tools.zip && \
    mkdir -p /usr/local/android-sdk/cmdline-tools/latest && \
    unzip -q android-tools.zip -d /usr/local/android-sdk/cmdline-tools/latest && \
    rm android-tools.zip

ENV ANDROID_HOME=/usr/local/android-sdk
ENV PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# Accetta le licenze Android e installa strumenti necessari
RUN yes | sdkmanager --licenses && \
    sdkmanager --install "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Installa Cordova globalmente
RUN npm install -g cordova

# Copia il progetto nella directory di lavoro del container
WORKDIR /app
COPY . .

# Aggiungi la piattaforma Android
RUN cordova platform add android

# Comando per eseguire la build
CMD ["cordova", "build", "android", "--release"]
