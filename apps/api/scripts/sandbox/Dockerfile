FROM codercom/code-server:latest

# Install Node.js LTS (v20) and npm
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Expose code-server port
EXPOSE 8080

# Switch back to coder user
USER coder

# Create workspace directory
WORKDIR /home/coder/workspace

# Start code-server without authentication for sandbox convenience
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "/home/coder/workspace"]
