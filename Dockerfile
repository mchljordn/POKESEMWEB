FROM apache/jena-fuseki:latest

# Set environment variables for Render
ENV PORT=3030
EXPOSE 3030

# Create a staging directory and copy the dataset
USER root
RUN mkdir -p /staging
COPY data-ontology/pokemon.ttl /staging/pokemon.ttl
RUN chown -R 9008:9008 /staging

# Switch back to the default non-root user for Fuseki
USER 9008

# Start Fuseki server, load the TTL file into memory, and serve it at /pokemon
CMD ["/jena-fuseki/fuseki-server", "--port=3030", "--file=/staging/pokemon.ttl", "/pokemon"]
