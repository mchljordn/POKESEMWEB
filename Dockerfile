FROM secoresearch/fuseki:latest

ENV PORT=3030
EXPOSE 3030

USER root
RUN mkdir -p /staging
COPY data-ontology/pokemon.ttl /staging/pokemon.ttl
RUN chmod -R 777 /staging

USER 9008

CMD ["/jena-fuseki/fuseki-server", "--port=3030", "--file=/staging/pokemon.ttl", "/pokemon"]

