# Étape 1 : Build de l'application Angular
FROM node:20-alpine as builder
WORKDIR /app
# Copier les fichiers package (package.json et package-lock.json) pour optimiser le cache
COPY package.json package-lock.json ./
RUN npm install
# Copier l'ensemble du code source
COPY . .
# Lancer la commande de build Angular en production
RUN npm run build --prod

# Étape 2 : Création de l'image de production avec Nginx
FROM nginx:alpine
# Supprimer le contenu par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*
# Copier le build Angular depuis l'étape de build dans le répertoire servi par Nginx
COPY --from=builder /app/dist/whistloux-fe/browser/ /usr/share/nginx/html/
# Copier votre configuration Nginx personnalisée (si besoin)
# Ici, adapte le nom du fichier de configuration si nécessaire
COPY nginx/lewhistloux.conf /etc/nginx/conf.d/default.conf
# Exposer le port 80 (celui que Nginx utilise par défaut)
EXPOSE 80
# Démarrer Nginx en mode "daemon off"
CMD ["nginx", "-g", "daemon off;"]
