FROM node:20-alpine

WORKDIR /app

# Copiar solo package files primero para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

EXPOSE 5173

# Configurar variables de entorno para polling
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Usar --host 0.0.0.0 para escuchar en todas las interfaces
# El hot reload está habilitado por defecto en modo dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
