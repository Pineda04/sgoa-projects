FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# RUN printf "server {\n\
#     listen 80;\n\
#     location / {\n\
#         root /usr/share/nginx/html;\n\
#         index index.html;\n\
#     }\n\
# }" > /etc/nginx/conf.d/spi_backend.conf

COPY default.conf /etc/nginx/conf.d/

COPY certs /etc/nginx/certs

EXPOSE 80 443
